import { Helper } from 'casbin';
import { MongoClient } from 'mongodb';
import logdown from 'logdown';
import { createCasbinRule } from './casbin-rule.entity';
const logger = logdown('CasbinMongoAdapter');
/**
 * TypeORMAdapter represents the TypeORM adapter for policy storage.
 */
export class MongoAdapter {
    /**
     * newAdapter is the constructor.
     * @param adapterOption
     */
    static async newAdapter(adapterOption) {
        const { uri, option, collection = 'casbin', database = 'casbindb', filtered = false, debug = false } = adapterOption;
        logger.state.isEnabled = debug;
        const a = new MongoAdapter(uri, database, collection, filtered, option);
        await a.open();
        return a;
    }
    useFilter = false;
    databaseName;
    mongoClient;
    collectionName;
    constructor(uri, database, collection, filtered, option) {
        if (!uri) {
            throw new Error('you must provide mongo URI to connect to!');
        }
        // Cache the mongo uri and db name for later use
        this.databaseName = database;
        this.collectionName = collection;
        this.useFilter = filtered;
        try {
            // Create a new MongoClient
            this.mongoClient = new MongoClient(uri, option);
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    isFiltered() {
        return this.useFilter;
    }
    async close() {
        try {
            await this.mongoClient.close();
        }
        catch (error) {
            throw new Error('MongoDB is not connected');
        }
    }
    /**
     * loadPolicy loads all policy rules from the storage.
     */
    async loadPolicy(model) {
        await this.loadFilteredPolicy(model);
    }
    /**
     * loadPolicy loads filtered policy rules from the storage.
     */
    async loadFilteredPolicy(model, filter) {
        try {
            let lines;
            if (this.useFilter) {
                lines = await this.getCollection()
                    .find(filter)
                    .toArray();
            }
            else {
                lines = await this.getCollection()
                    .find()
                    .toArray();
            }
            for (const line of lines) {
                this.loadPolicyLine(line, model);
            }
        }
        catch (e) {
            logger.error(e);
            throw new Error(e.message);
        }
    }
    /**
     * savePolicy saves all policy rules to the storage.
     */
    async savePolicy(model) {
        await this.clearCollection();
        let astMap = model.model.get('p');
        const lines = [];
        if (!astMap) {
            return false;
        }
        for (const [ptype, ast] of astMap) {
            for (const rule of ast.policy) {
                const line = this.savePolicyLine(ptype, rule);
                lines.push(line);
            }
        }
        astMap = model.model.get('g');
        if (!astMap) {
            return false;
        }
        for (const [ptype, ast] of astMap) {
            for (const rule of ast.policy) {
                const line = this.savePolicyLine(ptype, rule);
                lines.push(line);
            }
        }
        if (Array.isArray(lines) && lines.length > 0) {
            await this.getCollection().insertMany(lines);
        }
        return true;
    }
    /**
     * addPolicy adds a policy rule to the storage.
     */
    async addPolicy(_sec, ptype, rule) {
        const line = this.savePolicyLine(ptype, rule);
        await this.getCollection().insertOne(line);
    }
    /**
     * removePolicy removes a policy rule from the storage.
     */
    async removePolicy(_sec, ptype, rule) {
        const line = this.deletePolicyLine(ptype, rule);
        await this.getCollection().deleteOne(line);
    }
    /**
     * addPolicies adds many policies with rules to the storage.
     */
    async addPolicies(_sec, ptype, rules) {
        const lines = [];
        for (const r of rules) {
            lines.push(this.savePolicyLine(ptype, r));
        }
        await this.getCollection().insertMany(lines);
    }
    /**
     * removeFilteredPolicy removes many policy rules from the storage.
     */
    async removePolicies(_sec, ptype, rules) {
        const lines = [];
        for (const r of rules) {
            lines.push(this.deletePolicyLine(ptype, r));
        }
        const promises = [];
        for (const line of lines) {
            promises.push(this.getCollection().deleteOne(line));
        }
        await Promise.all(promises);
    }
    /**
     * removeFilteredPolicy removes policy rules that match the filter from the storage.
     */
    async removeFilteredPolicy(_sec, ptype, fieldIndex, ...fieldValues) {
        const line = {};
        line.ptype = ptype;
        if (fieldIndex <= 0 && 0 < fieldIndex + fieldValues.length) {
            line.v0 = fieldValues[0 - fieldIndex];
        }
        if (fieldIndex <= 1 && 1 < fieldIndex + fieldValues.length) {
            line.v1 = fieldValues[1 - fieldIndex];
        }
        if (fieldIndex <= 2 && 2 < fieldIndex + fieldValues.length) {
            line.v2 = fieldValues[2 - fieldIndex];
        }
        if (fieldIndex <= 3 && 3 < fieldIndex + fieldValues.length) {
            line.v3 = fieldValues[3 - fieldIndex];
        }
        if (fieldIndex <= 4 && 4 < fieldIndex + fieldValues.length) {
            line.v4 = fieldValues[4 - fieldIndex];
        }
        if (fieldIndex <= 5 && 5 < fieldIndex + fieldValues.length) {
            line.v5 = fieldValues[5 - fieldIndex];
        }
        await this.getCollection().deleteMany(line);
    }
    async createDBIndex() {
        try {
            const indexFields = [
                'ptype',
                'v0',
                'v1',
                'v2',
                'v3',
                'v4',
                'v5'
            ];
            for (const name of indexFields) {
                await this.getCollection().createIndex({ [name]: 1 });
            }
            logger.info('Indexes created');
        }
        catch (e) {
            logger.error(e);
        }
    }
    async open() {
        try {
            await this.mongoClient.connect();
            await this.createDBIndex();
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    getCollection() {
        try {
            return this.mongoClient
                .db(this.databaseName)
                .collection(this.collectionName);
        }
        catch {
            throw new Error('MongoDB is not connected');
        }
    }
    getDatabase() {
        try {
            return this.mongoClient.db(this.databaseName);
        }
        catch {
            throw new Error('MongoDB is not connected');
        }
    }
    async clearCollection() {
        try {
            const list = await this.getDatabase()
                .listCollections({ name: this.collectionName })
                .toArray();
            if (list && list.length > 0) {
                await this.getCollection().drop();
            }
            return;
        }
        catch {
            return;
        }
    }
    loadPolicyLine(line, model) {
        const result = line.ptype +
            ', ' +
            [line.v0, line.v1, line.v2, line.v3, line.v4, line.v5]
                .filter(n => n)
                .join(', ');
        Helper.loadPolicyLine(result, model);
    }
    populateCasbinRule(line, ptype, rule) {
        line.ptype = ptype;
        for (let i = 0; i < rule.length && i < 6; i++) {
            line[`v${i}`] = rule[i];
        }
    }
    savePolicyLine(ptype, rule) {
        const line = createCasbinRule({ includeTimestamps: true });
        this.populateCasbinRule(line, ptype, rule);
        return line;
    }
    deletePolicyLine(ptype, rule) {
        const line = createCasbinRule({ includeTimestamps: false });
        this.populateCasbinRule(line, ptype, rule);
        return line;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRhcHRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWIvYWRhcHRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsTUFBTSxFQUF3QyxNQUFNLFFBQVEsQ0FBQztBQUN0RSxPQUFPLEVBRUwsV0FBVyxFQUlaLE1BQU0sU0FBUyxDQUFDO0FBQ2pCLE9BQU8sT0FBTyxNQUFNLFNBQVMsQ0FBQztBQUM5QixPQUFPLEVBQWMsZ0JBQWdCLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQVdwRSxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsb0JBQW9CLENBQUMsQ0FBQztBQUU3Qzs7R0FFRztBQUNILE1BQU0sT0FBTyxZQUFZO0lBQ3ZCOzs7T0FHRztJQUNJLE1BQU0sQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLGFBQWtDO1FBQy9ELE1BQU0sRUFDSixHQUFHLEVBQ0gsTUFBTSxFQUNOLFVBQVUsR0FBRyxRQUFRLEVBQ3JCLFFBQVEsR0FBRyxVQUFVLEVBQ3JCLFFBQVEsR0FBRyxLQUFLLEVBQ2hCLEtBQUssR0FBRyxLQUFLLEVBQ2QsR0FBRyxhQUFhLENBQUM7UUFFbEIsTUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO1FBRS9CLE1BQU0sQ0FBQyxHQUFHLElBQUksWUFBWSxDQUFDLEdBQUcsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUN4RSxNQUFNLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNmLE9BQU8sQ0FBQyxDQUFDO0lBQ1gsQ0FBQztJQUVNLFNBQVMsR0FBWSxLQUFLLENBQUM7SUFFakIsWUFBWSxDQUFTO0lBQ3JCLFdBQVcsQ0FBYztJQUN6QixjQUFjLENBQVM7SUFFeEMsWUFDRSxHQUFXLEVBQ1gsUUFBZ0IsRUFDaEIsVUFBa0IsRUFDbEIsUUFBaUIsRUFDakIsTUFBMkI7UUFFM0IsSUFBSSxDQUFDLEdBQUcs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UUFFbkIsSUFBSSxVQUFVLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxVQUFVLEdBQUcsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQzNELElBQUksQ0FBQyxFQUFFLEdBQUcsV0FBVyxDQUFDLENBQUMsR0FBRyxVQUFVLENBQUMsQ0FBQztRQUN4QyxDQUFDO1FBQ0QsSUFBSSxVQUFVLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxVQUFVLEdBQUcsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQzNELElBQUksQ0FBQyxFQUFFLEdBQUcsV0FBVyxDQUFDLENBQUMsR0FBRyxVQUFVLENBQUMsQ0FBQztRQUN4QyxDQUFDO1FBQ0QsSUFBSSxVQUFVLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxVQUFVLEdBQUcsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQzNELElBQUksQ0FBQyxFQUFFLEdBQUcsV0FBVyxDQUFDLENBQUMsR0FBRyxVQUFVLENBQUMsQ0FBQztRQUN4QyxDQUFDO1FBQ0QsSUFBSSxVQUFVLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxVQUFVLEdBQUcsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQzNELElBQUksQ0FBQyxFQUFFLEdBQUcsV0FBVyxDQUFDLENBQUMsR0FBRyxVQUFVLENBQUMsQ0FBQztRQUN4QyxDQUFDO1FBQ0QsSUFBSSxVQUFVLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxVQUFVLEdBQUcsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQzNELElBQUksQ0FBQyxFQUFFLEdBQUcsV0FBVyxDQUFDLENBQUMsR0FBRyxVQUFVLENBQUMsQ0FBQztRQUN4QyxDQUFDO1FBQ0QsSUFBSSxVQUFVLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxVQUFVLEdBQUcsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQzNELElBQUksQ0FBQyxFQUFFLEdBQUcsV0FBVyxDQUFDLENBQUMsR0FBRyxVQUFVLENBQUMsQ0FBQztRQUN4QyxDQUFDO1FBQ0QsTUFBTSxJQUFJLENB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