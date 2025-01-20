/**
 * Generated by Orval
 * Do not edit manually.
 * See `gen:api` script in package.json
 */
import type { HealthCheckSchemaHealth } from './healthCheckSchemaHealth';

/**
 * Used by service orchestrators to decide whether this Unleash instance should be marked as healthy or unhealthy
 */
export interface HealthCheckSchema {
    /** The state this Unleash instance is in. GOOD if everything is ok, BAD if the instance should be restarted */
    health: HealthCheckSchemaHealth;
}
