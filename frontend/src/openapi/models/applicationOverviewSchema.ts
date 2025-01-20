/**
 * Generated by Orval
 * Do not edit manually.
 * See `gen:api` script in package.json
 */
import type { ApplicationOverviewEnvironmentSchema } from './applicationOverviewEnvironmentSchema';
import type { ApplicationOverviewIssuesSchema } from './applicationOverviewIssuesSchema';

/**
 * Data about an application that's connected to Unleash via an SDK.
 */
export interface ApplicationOverviewSchema {
    /** The list of environments the application has been using. */
    environments: ApplicationOverviewEnvironmentSchema[];
    /** The number of features the application has been using. */
    featureCount: number;
    /** This list of issues that might be wrong with the application */
    issues: ApplicationOverviewIssuesSchema;
    /** The list of projects the application has been using. */
    projects: string[];
}
