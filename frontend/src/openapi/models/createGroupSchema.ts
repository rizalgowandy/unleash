/**
 * Generated by Orval
 * Do not edit manually.
 * See `gen:api` script in package.json
 */
import type { CreateGroupSchemaUsersItem } from './createGroupSchemaUsersItem';

/**
 * A detailed information about a user group
 */
export interface CreateGroupSchema {
    /**
     * A custom description of the group
     * @nullable
     */
    description?: string | null;
    /** A list of SSO groups that should map to this Unleash group */
    mappingsSSO?: string[];
    /** The name of the group */
    name: string;
    /**
     * A role id that is used as the root role for all users in this group. This can be either the id of the Viewer, Editor or Admin role.
     * @nullable
     */
    rootRole?: number | null;
    /** A list of users belonging to this group */
    users?: CreateGroupSchemaUsersItem[];
}
