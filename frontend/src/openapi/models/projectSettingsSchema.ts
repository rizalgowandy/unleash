/**
 * Generated by Orval
 * Do not edit manually.
 * See `gen:api` script in package.json
 */
import type { ProjectSettingsSchemaDefaultStickiness } from './projectSettingsSchemaDefaultStickiness';
import type { ProjectSettingsSchemaMode } from './projectSettingsSchemaMode';

/**
 * Project settings for a given project
 */
export interface ProjectSettingsSchema {
    /**
     * The [default stickiness for this project](https://docs.getunleash.io/reference/stickiness#project-default-stickiness)
     * @nullable
     */
    defaultStickiness: ProjectSettingsSchemaDefaultStickiness;
    /**
     * The project's [collaboration mode](https://docs.getunleash.io/reference/project-collaboration-mode).
     * @nullable
     */
    mode: ProjectSettingsSchemaMode;
}
