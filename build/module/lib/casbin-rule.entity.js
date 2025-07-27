/**
 * Creates a Casbin Rule object
 */
export function createCasbinRule(options) {
    const rule = {};
    if (options?.includeTimestamps) {
        const now = new Date().toISOString();
        rule.createdAt = now;
        rule.updatedAt = now;
    }
    return rule;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FzYmluLXJ1bGUuZW50aXR5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xpYi9jYXNiaW4tcnVsZS5lbnRpdHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBZUE7O0dBRUc7QUFDSCxNQUFNLFVBQVUsZ0JBQWdCLENBQUMsT0FFaEM7SUFDQyxNQUFNLElBQUksR0FBZSxFQUFFLENBQUM7SUFFNUIsSUFBSSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsQ0FBQztRQUMvQixNQUFNLEdBQUcsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ3JDLElBQUksQ0FBQyxTQUFTLEdBQUcsR0FBRyxDQUFDO1FBQ3JCLElBQUksQ0FBQyxTQUFTLEdBQUcsR0FBRyxDQUFDO0lBQ3ZCLENBQUM7SUFFRCxPQUFPLElBQUksQ0FBQztBQUNkLENBQUMifQ==