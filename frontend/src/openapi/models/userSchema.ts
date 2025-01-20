/**
 * Generated by Orval
 * Do not edit manually.
 * See `gen:api` script in package.json
 */

/**
 * An Unleash user
 */
export interface UserSchema {
    /** A user is either an actual User or a Service Account */
    accountType?: string;
    /**
     * Count of active browser sessions for this user
     * @nullable
     */
    activeSessions?: number | null;
    /** The user was created at this time */
    createdAt?: string;
    /** Experimental. The number of deleted browser sessions after last login */
    deletedSessions?: number;
    /** Email of the user */
    email?: string;
    /** Is the welcome email sent to the user or not */
    emailSent?: boolean;
    /** The user id */
    id: number;
    /** URL used for the user profile image */
    imageUrl?: string;
    /** If the user is actively inviting other users, this is the link that can be shared with other users */
    inviteLink?: string;
    /**
     * Deprecated in v5. Used internally to know which operations the user should be allowed to perform
     * @deprecated
     */
    isAPI?: boolean;
    /**
     * How many unsuccessful attempts at logging in has the user made
     * @minimum 0
     */
    loginAttempts?: number;
    /**
     * Name of the user
     * @nullable
     */
    name?: string | null;
    /** Deprecated */
    permissions?: string[];
    /**
     * Which [root role](https://docs.getunleash.io/reference/rbac#predefined-roles) this user is assigned
     * @minimum 0
     */
    rootRole?: number;
    /**
     * The SCIM ID of the user, only present if managed by SCIM
     * @nullable
     */
    scimId?: string | null;
    /**
     * The last time this user logged in
     * @nullable
     */
    seenAt?: string | null;
    /**
     * A unique username for the user
     * @nullable
     */
    username?: string | null;
}
