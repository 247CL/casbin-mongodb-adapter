/**
 * Represents a Casbin Rule
 */
export interface CasbinRule {
    ptype?: string;
    v0?: string;
    v1?: string;
    v2?: string;
    v3?: string;
    v4?: string;
    v5?: string;
    createdAt?: string;
    updatedAt?: string;
}
/**
 * Creates a Casbin Rule object
 */
export declare function createCasbinRule(options?: {
    includeTimestamps?: boolean;
}): CasbinRule;
