/**
 * Generated by Orval
 * Do not edit manually.
 * See `gen:api` script in package.json
 */
import type { RoleSchema } from './roleSchema';

/**
 * A list of roles
 */
export interface RolesSchema {
    /** A list of roles */
    roles: RoleSchema[];
    /**
     * The version of the role schema used
     * @minimum 1
     */
    version: number;
}
