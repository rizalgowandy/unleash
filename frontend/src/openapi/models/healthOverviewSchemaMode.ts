/**
 * Generated by Orval
 * Do not edit manually.
 * See `gen:api` script in package.json
 */

/**
 * The project's [collaboration mode](https://docs.getunleash.io/reference/project-collaboration-mode). Determines whether non-project members can submit change requests or not.
 */
export type HealthOverviewSchemaMode =
    (typeof HealthOverviewSchemaMode)[keyof typeof HealthOverviewSchemaMode];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const HealthOverviewSchemaMode = {
    open: 'open',
    protected: 'protected',
    private: 'private',
} as const;
