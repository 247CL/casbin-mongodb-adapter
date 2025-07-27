"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCasbinRule = createCasbinRule;
/**
 * Creates a Casbin Rule object
 */
function createCasbinRule(options) {
    const rule = {};
    if (options === null || options === void 0 ? void 0 : options.includeTimestamps) {
        const now = new Date().toISOString();
        rule.createdAt = now;
        rule.updatedAt = now;
    }
    return rule;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FzYmluLXJ1bGUuZW50aXR5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xpYi9jYXNiaW4tcnVsZS5lbnRpdHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFrQkEsNENBWUM7QUFmRDs7R0FFRztBQUNILFNBQWdCLGdCQUFnQixDQUFDLE9BRWhDO0lBQ0MsTUFBTSxJQUFJLEdBQWUsRUFBRSxDQUFDO0lBRTVCLElBQUksT0FBTyxhQUFQLE9BQU8sdUJBQVAsT0FBTyxDQUFFLGlCQUFpQixFQUFFLENBQUM7UUFDL0IsTUFBTSxHQUFHLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUNyQyxJQUFJLENBQUMsU0FBUyxHQUFHLEdBQUcsQ0FBQztRQUNyQixJQUFJLENBQUMsU0FBUyxHQUFHLEdBQUcsQ0FBQztJQUN2QixDQUFDO0lBRUQsT0FBTyxJQUFJLENBQUM7QUFDZCxDQUFDIn0=