import type { Logger } from '../../logger';
import type {
    IContextField,
    IContextFieldDto,
    IContextFieldStore,
} from './context-field-store-type';
import type {
    IFeatureStrategiesStore,
    IUnleashStores,
} from '../../types/stores';
import type { IUnleashConfig } from '../../types/option';
import type { ContextFieldStrategiesSchema } from '../../openapi/spec/context-field-strategies-schema';
import {
    CONTEXT_FIELD_CREATED,
    CONTEXT_FIELD_DELETED,
    CONTEXT_FIELD_UPDATED,
    type IAuditUser,
    type IFeatureStrategy,
    type IFlagResolver,
} from '../../types';
import type { IPrivateProjectChecker } from '../private-project/privateProjectCheckerType';
import type EventService from '../events/event-service';
import { contextSchema, legalValueSchema } from '../../services/context-schema';
import { NameExistsError } from '../../error';
import { nameSchema } from '../../schema/feature-schema';
import type { LegalValueSchema } from '../../openapi';

class ContextService {
    private eventService: EventService;

    private contextFieldStore: IContextFieldStore;

    private featureStrategiesStore: IFeatureStrategiesStore;

    private logger: Logger;

    private flagResolver: IFlagResolver;

    private privateProjectChecker: IPrivateProjectChecker;

    constructor(
        {
            contextFieldStore,
            featureStrategiesStore,
        }: Pick<IUnleashStores, 'contextFieldStore' | 'featureStrategiesStore'>,
        {
            getLogger,
            flagResolver,
        }: Pick<IUnleashConfig, 'getLogger' | 'flagResolver'>,
        eventService: EventService,
        privateProjectChecker: IPrivateProjectChecker,
    ) {
        this.privateProjectChecker = privateProjectChecker;
        this.eventService = eventService;
        this.flagResolver = flagResolver;
        this.contextFieldStore = contextFieldStore;
        this.featureStrategiesStore = featureStrategiesStore;
        this.logger = getLogger('services/context-service.js');
    }

    async getAll(): Promise<IContextField[]> {
        return this.contextFieldStore.getAll();
    }

    async getContextField(name: string): Promise<IContextField> {
        return this.contextFieldStore.get(name);
    }

    async getStrategiesByContextField(
        name: string,
        userId: number,
    ): Promise<ContextFieldStrategiesSchema> {
        const strategies =
            await this.featureStrategiesStore.getStrategiesByContextField(name);
        const accessibleProjects =
            await this.privateProjectChecker.getUserAccessibleProjects(userId);
        if (accessibleProjects.mode === 'all') {
            return this.mapStrategies(strategies);
        } else {
            return this.mapStrategies(
                strategies.filter((strategy) =>
                    accessibleProjects.projects.includes(strategy.projectId),
                ),
            );
        }
    }

    private mapStrategies(strategies: IFeatureStrategy[]) {
        return {
            strategies: strategies.map((strategy) => ({
                id: strategy.id,
                projectId: strategy.projectId,
                featureName: strategy.featureName,
                strategyName: strategy.strategyName,
                environment: strategy.environment,
            })),
        };
    }

    async createContextField(
        value: IContextFieldDto,
        auditUser: IAuditUser,
    ): Promise<IContextField> {
        // validations
        await this.validateUniqueName(value);
        const contextField = await contextSchema.validateAsync(value);

        // creations
        const createdField = await this.contextFieldStore.create(value);
        await this.eventService.storeEvent({
            type: CONTEXT_FIELD_CREATED,
            createdBy: auditUser.username,
            createdByUserId: auditUser.id,
            ip: auditUser.ip,
            data: contextField,
        });

        return createdField;
    }

    async updateContextField(
        updatedContextField: IContextFieldDto,
        auditUser: IAuditUser,
    ): Promise<void> {
        const contextField = await this.contextFieldStore.get(
            updatedContextField.name,
        );
        const value = await contextSchema.validateAsync(updatedContextField);

        await this.contextFieldStore.update(value);

        const { createdAt, sortOrder, ...previousContextField } = contextField;
        await this.eventService.storeEvent({
            type: CONTEXT_FIELD_UPDATED,
            createdBy: auditUser.username,
            createdByUserId: auditUser.id,
            ip: auditUser.ip,
            preData: previousContextField,
            data: value,
        });
    }

    async updateLegalValue(
        contextFieldLegalValue: { name: string; legalValue: LegalValueSchema },
        auditUser: IAuditUser,
    ): Promise<void> {
        const contextField = await this.contextFieldStore.get(
            contextFieldLegalValue.name,
        );
        const validatedLegalValue = await legalValueSchema.validateAsync(
            contextFieldLegalValue.legalValue,
        );

        const legalValues = contextField.legalValues
            ? [...contextField.legalValues]
            : [];

        const existingIndex = legalValues.findIndex(
            (legalvalue) => legalvalue.value === validatedLegalValue.value,
        );

        if (existingIndex !== -1) {
            legalValues[existingIndex] = validatedLegalValue;
        } else {
            legalValues.push(validatedLegalValue);
        }

        const newContextField = { ...contextField, legalValues };

        await this.contextFieldStore.update(newContextField);

        await this.eventService.storeEvent({
            type: CONTEXT_FIELD_UPDATED,
            createdBy: auditUser.username,
            createdByUserId: auditUser.id,
            ip: auditUser.ip,
            preData: contextField,
            data: newContextField,
        });
    }

    async deleteLegalValue(
        contextFieldLegalValue: { name: string; legalValue: string },
        auditUser: IAuditUser,
    ): Promise<void> {
        const contextField = await this.contextFieldStore.get(
            contextFieldLegalValue.name,
        );

        const newContextField = {
            ...contextField,
            legalValues: contextField.legalValues?.filter(
                (legalValue) =>
                    legalValue.value !== contextFieldLegalValue.legalValue,
            ),
        };

        await this.contextFieldStore.update(newContextField);

        await this.eventService.storeEvent({
            type: CONTEXT_FIELD_UPDATED,
            createdBy: auditUser.username,
            createdByUserId: auditUser.id,
            ip: auditUser.ip,
            preData: contextField,
            data: newContextField,
        });
    }

    async deleteContextField(
        name: string,
        auditUser: IAuditUser,
    ): Promise<void> {
        const contextField = await this.contextFieldStore.get(name);

        // delete
        await this.contextFieldStore.delete(name);
        await this.eventService.storeEvent({
            type: CONTEXT_FIELD_DELETED,
            createdBy: auditUser.username,
            createdByUserId: auditUser.id,
            ip: auditUser.ip,
            preData: contextField,
        });
    }

    async validateUniqueName({
        name,
    }: Pick<IContextFieldDto, 'name'>): Promise<void> {
        let msg: string | undefined;
        try {
            await this.contextFieldStore.get(name);
            msg = 'A context field with that name already exist';
        } catch (error) {
            // No conflict, everything ok!
            return;
        }

        // Intentional throw here!
        throw new NameExistsError(msg);
    }

    async validateName(name: string): Promise<void> {
        await nameSchema.validateAsync({ name });
        await this.validateUniqueName({ name });
    }
}
export default ContextService;
module.exports = ContextService;