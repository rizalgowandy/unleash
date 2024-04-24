import type { FC } from 'react';
import { ReactComponent as InitialStageIcon } from 'assets/icons/stage-initial.svg';
import { ReactComponent as PreLiveStageIcon } from 'assets/icons/stage-pre-live.svg';
import { ReactComponent as LiveStageIcon } from 'assets/icons/stage-live.svg';
import { ReactComponent as CompletedStageIcon } from 'assets/icons/stage-completed.svg';
import { ReactComponent as CompletedDiscardedStageIcon } from 'assets/icons/stage-completed-discarded.svg';
import { ReactComponent as ArchivedStageIcon } from 'assets/icons/stage-archived.svg';

export type LifecycleStage =
    | { name: 'initial' }
    | {
          name: 'pre-live';
          environments: Array<{ name: string; lastSeenAt: string }>;
      }
    | {
          name: 'live';
          environments: Array<{ name: string; lastSeenAt: string }>;
      }
    | {
          name: 'completed';
          status: 'kept' | 'discarded';
      }
    | { name: 'archived' };

export const FeatureLifecycleStageIcon: FC<{ stage: LifecycleStage }> = ({
    stage,
}) => {
    if (stage.name === 'archived') {
        return <ArchivedStageIcon />;
    } else if (stage.name === 'pre-live') {
        return <PreLiveStageIcon />;
    } else if (stage.name === 'live') {
        return <LiveStageIcon />;
    } else if (stage.name === 'completed' && stage.status === 'kept') {
        return <CompletedStageIcon />;
    } else if (stage.name === 'completed' && stage.status === 'discarded') {
        return <CompletedDiscardedStageIcon />;
    } else {
        return <InitialStageIcon />;
    }
};