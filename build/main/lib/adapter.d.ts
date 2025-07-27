import { Model, BatchAdapter, FilteredAdapter } from 'casbin';
import { MongoClientOptions, Filter } from 'mongodb';
interface MongoAdapterOptions {
    readonly uri: string;
    readonly option?: MongoClientOptions;
    readonly database: string;
    readonly collection: string;
    readonly filtered?: boolean;
    readonly debug?: boolean;
}
/**
 * TypeORMAdapter represents the TypeORM adapter for policy storage.
 */
export declare class MongoAdapter implements FilteredAdapter, BatchAdapter {
    /**
     * newAdapter is the constructor.
     * @param adapterOption
     */
    static newAdapter(adapterOption: MongoAdapterOptions): Promise<MongoAdapter>;
    useFilter: boolean;
    private readonly databaseName;
    private readonly mongoClient;
    private readonly collectionName;
    private constructor();
    isFiltered(): boolean;
    close(): Promise<void>;
    /**
     * loadPolicy loads all policy rules from the storage.
     */
    loadPolicy(model: Model): Promise<void>;
    /**
     * loadPolicy loads filtered policy rules from the storage.
     */
    loadFilteredPolicy(model: Model, filter?: Filter<any>): Promise<void>;
    /**
     * savePolicy saves all policy rules to the storage.
     */
    savePolicy(model: Model): Promise<boolean>;
    /**
     * addPolicy adds a policy rule to the storage.
     */
    addPolicy(_sec: string, ptype: string, rule: string[]): Promise<void>;
    /**
     * removePolicy removes a policy rule from the storage.
     */
    removePolicy(_sec: string, ptype: string, rule: string[]): Promise<void>;
    /**
     * addPolicies adds many policies with rules to the storage.
     */
    addPolicies(_sec: string, ptype: string, rules: string[][]): Promise<void>;
    /**
     * removeFilteredPolicy removes many policy rules from the storage.
     */
    removePolicies(_sec: string, ptype: string, rules: string[][]): Promise<void>;
    /**
     * removeFilteredPolicy removes policy rules that match the filter from the storage.
     */
    removeFilteredPolicy(_sec: string, ptype: string, fieldIndex: number, ...fieldValues: string[]): Promise<void>;
    createDBIndex(): Promise<void>;
    open(): Promise<void>;
    private getCollection;
    private getDatabase;
    private clearCollection;
    private loadPolicyLine;
    private populateCasbinRule;
    private savePolicyLine;
    private deletePolicyLine;
}
export {};
