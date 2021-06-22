import EventStore from '../db/event-store';
import FeatureTagStore from '../db/feature-tag-store';
import TagStore, { ITag } from '../db/tag-store';
import NotFoundError from '../error/notfound-error';
import { Logger } from '../logger';
import { nameSchema } from '../schema/feature-schema';
import { FEATURE_TAGGED, FEATURE_UNTAGGED, TAG_CREATED } from '../types/events';
import { IUnleashConfig } from '../types/option';
import { IUnleashStores } from '../types/stores';
import { tagSchema } from './tag-schema';

class FeatureTagService {
    private tagStore: TagStore;

    private featureTagStore: FeatureTagStore;

    private eventStore: EventStore;

    private logger: Logger;

    constructor(
        {
            tagStore,
            featureTagStore,
            eventStore,
        }: Pick<IUnleashStores, 'tagStore' | 'featureTagStore' | 'eventStore'>,
        { getLogger }: Pick<IUnleashConfig, 'getLogger'>,
    ) {
        this.logger = getLogger('/services/feature-tag-service.ts');
        this.tagStore = tagStore;
        this.featureTagStore = featureTagStore;
        this.eventStore = eventStore;
    }

    async listTags(featureName: string): Promise<ITag[]> {
        return this.featureTagStore.getAllTagsForFeature(featureName);
    }

    async addTag(
        featureName: string,
        tag: ITag,
        userName: string,
    ): Promise<ITag> {
        await nameSchema.validateAsync({ name: featureName });
        const validatedTag = await tagSchema.validateAsync(tag);
        await this.createTagIfNeeded(validatedTag, userName);
        await this.featureTagStore.tagFeature(featureName, validatedTag);

        await this.eventStore.store({
            type: FEATURE_TAGGED,
            createdBy: userName,
            data: {
                featureName,
                tag: validatedTag,
            },
        });
        return validatedTag;
    }

    async createTagIfNeeded(tag: ITag, userName: string): Promise<void> {
        try {
            await this.tagStore.getTag(tag.type, tag.value);
        } catch (error) {
            if (error instanceof NotFoundError) {
                await this.tagStore.createTag(tag);
                await this.eventStore.store({
                    type: TAG_CREATED,
                    createdBy: userName,
                    data: {
                        tag,
                    },
                });
            }
        }
    }

    async removeTag(
        featureName: string,
        tag: ITag,
        userName: string,
    ): Promise<void> {
        await this.featureTagStore.untagFeature(featureName, tag);
        await this.eventStore.store({
            type: FEATURE_UNTAGGED,
            createdBy: userName,
            data: {
                featureName,
                tag,
            },
        });
    }
}

export default FeatureTagService;
