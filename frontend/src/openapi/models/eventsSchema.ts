/**
 * Generated by Orval
 * Do not edit manually.
 * See `gen:api` script in package.json
 */
import type { EventSchema } from './eventSchema';
import type { EventsSchemaVersion } from './eventsSchemaVersion';

/**
 * A list of events that has happened in the system
 */
export interface EventsSchema {
    /** The list of events */
    events: EventSchema[];
    /**
     * The total count of events
     * @minimum 0
     */
    totalEvents?: number;
    /**
     * The api version of this response. A natural increasing number. Only increases if format changes
     * @minimum 1
     */
    version: EventsSchemaVersion;
}
