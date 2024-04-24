import { Box, styled, Typography } from '@mui/material';
import { Badge } from 'component/common/Badge/Badge';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';
import type * as React from 'react';
import type { FC } from 'react';
import { ReactComponent as InitialStageIcon } from 'assets/icons/stage-initial.svg';
import { ReactComponent as PreLiveStageIcon } from 'assets/icons/stage-pre-live.svg';
import { ReactComponent as LiveStageIcon } from 'assets/icons/stage-live.svg';
import { ReactComponent as CompletedStageIcon } from 'assets/icons/stage-completed.svg';
import { ReactComponent as CompletedDiscardedStageIcon } from 'assets/icons/stage-completed-discarded.svg';
import { ReactComponent as ArchivedStageIcon } from 'assets/icons/stage-archived.svg';
import CloudCircle from '@mui/icons-material/CloudCircle';
import { ReactComponent as UsageRate } from 'assets/icons/usage-rate.svg';
import {
    FeatureLifecycleStageIcon,
    type LifecycleStage,
} from './FeatureLifecycleStageIcon';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import TimeAgo from 'react-timeago';
import { StyledIconWrapper } from '../../FeatureEnvironmentSeen/FeatureEnvironmentSeen';
import { useLastSeenColors } from '../../FeatureEnvironmentSeen/useLastSeenColors';

const TimeLabel = styled('span')(({ theme }) => ({
    color: theme.palette.text.secondary,
}));

const InfoText = styled('p')(({ theme }) => ({
    paddingBottom: theme.spacing(1),
}));

const MainLifecycleRow = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(2),
}));

const TimeLifecycleRow = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(1.5),
}));

const IconsRow = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(6),
}));

const Line = styled(Box)(({ theme }) => ({
    height: '1px',
    background: theme.palette.background.application,
    flex: 1,
}));

const StageBox = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'active',
})<{ active?: boolean }>(({ theme, active }) => ({
    position: 'relative',
    // speech bubble triangle for active stage
    ...(active && {
        '&:before': {
            content: '""',
            position: 'absolute',
            display: 'block',
            borderStyle: 'solid',
            borderColor: `${theme.palette.primary.light} transparent`,
            borderWidth: '0 6px 6px',
            top: theme.spacing(3.25),
            left: theme.spacing(1.75),
        },
    }),
    // stage name text
    '&:after': {
        content: 'attr(data-after-content)',
        display: 'block',
        position: 'absolute',
        top: theme.spacing(4),
        left: theme.spacing(-1.25),
        right: theme.spacing(-1.25),
        textAlign: 'center',
        whiteSpace: 'nowrap',
        fontSize: theme.spacing(1.25),
        padding: theme.spacing(0.25, 0),
        color: theme.palette.text.secondary,
        // active wrapper for stage name text
        ...(active && {
            backgroundColor: theme.palette.primary.light,
            color: theme.palette.primary.contrastText,
            fontWeight: theme.fontWeight.bold,
            borderRadius: theme.spacing(0.5),
        }),
    },
}));

const ColorFill = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
    borderRadius: theme.spacing(0, 0, 1, 1), // has to match the parent tooltip container
    margin: theme.spacing(-1, -1.5), // has to match the parent tooltip container
    padding: theme.spacing(2, 3),
}));

const LastSeenIcon: FC<{ lastSeen: string }> = ({ lastSeen }) => {
    const getColor = useLastSeenColors();

    return (
        <TimeAgo
            date={lastSeen}
            title=''
            live={false}
            formatter={(value: number, unit: string) => {
                const [color, textColor] = getColor(unit);
                return (
                    <StyledIconWrapper style={{ background: color }}>
                        <UsageRate stroke={textColor} />
                    </StyledIconWrapper>
                );
            }}
        />
    );
};

const InitialStageDescription: FC = () => {
    return (
        <>
            <InfoText>
                This feature toggle is currently in the initial phase of it's
                life cycle.
            </InfoText>
            <InfoText>
                This means that the flag has been created, but it has not yet
                been seen in any environment.
            </InfoText>
            <InfoText>
                Once we detect metrics for a non-production environment it will
                move into pre-live.
            </InfoText>
        </>
    );
};

const StageTimeline: FC<{ stage: LifecycleStage }> = ({ stage }) => {
    return (
        <IconsRow>
            <StageBox
                data-after-content='Initial'
                active={stage.name === 'initial'}
            >
                <InitialStageIcon />
            </StageBox>

            <Line />

            <StageBox
                data-after-content='Pre-live'
                active={stage.name === 'pre-live'}
            >
                <PreLiveStageIcon />
            </StageBox>

            <Line />

            <StageBox data-after-content='Live' active={stage.name === 'live'}>
                <LiveStageIcon />
            </StageBox>

            <Line />

            <StageBox
                data-after-content='Completed'
                active={stage.name === 'completed'}
            >
                {stage.name === 'completed' && stage.status === 'discarded' ? (
                    <CompletedDiscardedStageIcon />
                ) : (
                    <CompletedStageIcon />
                )}
            </StageBox>

            <Line />

            <StageBox
                data-after-content='Archived'
                active={stage.name === 'archived'}
            >
                <ArchivedStageIcon />
            </StageBox>
        </IconsRow>
    );
};

const EnvironmentLine = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2),
}));

const CenteredBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

const LiveStageDescription: FC<{
    name: 'live' | 'pre-live';
    environments: Array<{ name: string; lastSeenAt: string }>;
}> = ({ name, environments }) => {
    return (
        <>
            <ConditionallyRender
                condition={name === 'pre-live'}
                show={
                    <InfoText>
                        We've seen the feature flag in the following
                        non-production environments:
                    </InfoText>
                }
            />
            <ConditionallyRender
                condition={name === 'live'}
                show={
                    <InfoText>
                        Users have been exposed to this feature in the following
                        production environments:
                    </InfoText>
                }
            />

            <Box>
                {environments.map((environment) => {
                    return (
                        <EnvironmentLine key={environment.name}>
                            <CenteredBox>
                                <CloudCircle />
                                <Box>{environment.name}</Box>
                            </CenteredBox>
                            <CenteredBox>
                                <TimeAgo
                                    minPeriod={60}
                                    date={environment.lastSeenAt}
                                />
                                <LastSeenIcon
                                    lastSeen={environment.lastSeenAt}
                                />
                            </CenteredBox>
                        </EnvironmentLine>
                    );
                })}
            </Box>
        </>
    );
};

export const FeatureLifecycleTooltip: FC<{
    children: React.ReactElement<any, any>;
    stage: LifecycleStage;
}> = ({ children, stage }) => (
    <HtmlTooltip
        maxHeight={800}
        maxWidth={350}
        arrow
        title={
            <Box>
                <Box sx={(theme) => ({ padding: theme.spacing(2) })}>
                    <MainLifecycleRow>
                        <Typography variant='h3'>Lifecycle</Typography>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                            }}
                        >
                            <Badge sx={{ textTransform: 'capitalize' }}>
                                {stage.name}
                            </Badge>
                            <FeatureLifecycleStageIcon stage={stage} />
                        </Box>
                    </MainLifecycleRow>
                    <TimeLifecycleRow>
                        <TimeLabel>Stage entered at</TimeLabel>
                        <span>14/01/2024</span>
                    </TimeLifecycleRow>
                    <TimeLifecycleRow>
                        <TimeLabel>Time spent in stage</TimeLabel>
                        <span>3 days</span>
                    </TimeLifecycleRow>
                    <StageTimeline stage={stage} />
                </Box>
                <ColorFill>
                    {stage.name === 'initial' && <InitialStageDescription />}
                    {(stage.name === 'pre-live' || stage.name === 'live') && (
                        <LiveStageDescription
                            name={stage.name}
                            environments={stage.environments}
                        />
                    )}
                </ColorFill>
            </Box>
        }
    >
        <Box>{children}</Box>
    </HtmlTooltip>
);