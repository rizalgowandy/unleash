import { styled } from '@mui/material';
import type { EventSchema, EventSchemaType } from 'openapi';
import { startOfDay, sub } from 'date-fns';
import { useEventSearch } from 'hooks/api/getters/useEventSearch/useEventSearch';
import { EventTimelineEventGroup } from './EventTimelineEventGroup/EventTimelineEventGroup';
import { EventTimelineHeader } from './EventTimelineHeader/EventTimelineHeader';
import { useEventTimeline } from './useEventTimeline';
import { useMemo } from 'react';

export type EnrichedEvent = EventSchema & {
    label: string;
    summary: string;
    timestamp: number;
};

export type TimelineEventGroup = EnrichedEvent[];

const StyledRow = styled('div')({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
});

const StyledTimelineContainer = styled('div')(({ theme }) => ({
    position: 'relative',
    height: theme.spacing(1),
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1.5, 0),
}));

const StyledTimeline = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.divider,
    height: theme.spacing(0.5),
    width: '100%',
}));

const StyledMiddleMarkerContainer = styled('div')({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
});

const StyledMarker = styled('div')(({ theme }) => ({
    position: 'absolute',
    height: theme.spacing(1),
    width: theme.spacing(0.25),
    backgroundColor: theme.palette.text.secondary,
}));

const StyledMiddleMarker = styled(StyledMarker)(({ theme }) => ({
    top: theme.spacing(-2),
}));

const StyledMarkerLabel = styled('div')(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    color: theme.palette.text.secondary,
}));

const StyledStart = styled(StyledMarker)({
    left: 0,
});

const StyledEnd = styled(StyledMarker)({
    right: 0,
});

const RELEVANT_EVENT_TYPES: EventSchemaType[] = [
    'strategy-reactivated',
    'strategy-updated',
    'segment-updated',
    'segment-deleted',
    'feature-created',
    'feature-updated',
    'feature-variants-updated',
    'feature-archived',
    'feature-revived',
    'feature-strategy-update',
    'feature-strategy-add',
    'feature-strategy-remove',
    'feature-environment-enabled',
    'feature-environment-disabled',
];

const toISODateString = (date: Date) => date.toISOString().split('T')[0];

export const EventTimeline = () => {
    const { timeSpan, environment, setTimeSpan, setEnvironment } =
        useEventTimeline();

    const endDate = new Date();
    const startDate = sub(endDate, timeSpan.value);
    const endTime = endDate.getTime();
    const startTime = startDate.getTime();

    const { events: baseEvents } = useEventSearch(
        {
            from: `IS:${toISODateString(startOfDay(startDate))}`,
            to: `IS:${toISODateString(endDate)}`,
            type: `IS_ANY_OF:${RELEVANT_EVENT_TYPES.join(',')}`,
        },
        { refreshInterval: 10 * 1000 },
    );

    const events = useMemo(() => {
        return baseEvents.map((event) => ({
            ...event,
            timestamp: new Date(event.createdAt).getTime(),
        }));
    }, [baseEvents]) as EnrichedEvent[];

    const filteredEvents = events.filter(
        (event) =>
            event.timestamp >= startTime &&
            event.timestamp <= endTime &&
            (!event.environment ||
                !environment ||
                event.environment === environment.name),
    );

    const sortedEvents = filteredEvents.reverse();

    const timespanInMs = endTime - startTime;
    const groupingThresholdInMs = useMemo(
        () => timespanInMs * 0.02,
        [timespanInMs],
    );

    const groups = useMemo(
        () =>
            sortedEvents.reduce((groups: TimelineEventGroup[], event) => {
                if (groups.length === 0) {
                    groups.push([event]);
                } else {
                    const lastGroup = groups[groups.length - 1];
                    const lastEventInGroup = lastGroup[lastGroup.length - 1];

                    if (
                        event.timestamp - lastEventInGroup.timestamp <=
                        groupingThresholdInMs
                    ) {
                        lastGroup.push(event);
                    } else {
                        groups.push([event]);
                    }
                }
                return groups;
            }, []),
        [sortedEvents, groupingThresholdInMs],
    );

    return (
        <>
            <StyledRow>
                <EventTimelineHeader
                    totalEvents={sortedEvents.length}
                    timeSpan={timeSpan}
                    setTimeSpan={setTimeSpan}
                    environment={environment}
                    setEnvironment={setEnvironment}
                />
            </StyledRow>
            <StyledTimelineContainer>
                <StyledTimeline />
                <StyledStart />
                {groups.map((group) => (
                    <EventTimelineEventGroup
                        key={group[0].id}
                        group={group}
                        startDate={startDate}
                        endDate={endDate}
                    />
                ))}
                <StyledEnd />
            </StyledTimelineContainer>
            <StyledRow>
                <StyledMarkerLabel>{timeSpan.markers[0]}</StyledMarkerLabel>
                {timeSpan.markers.slice(1).map((marker) => (
                    <StyledMiddleMarkerContainer key={marker}>
                        <StyledMiddleMarker />
                        <StyledMarkerLabel>{marker}</StyledMarkerLabel>
                    </StyledMiddleMarkerContainer>
                ))}
                <StyledMarkerLabel>now</StyledMarkerLabel>
            </StyledRow>
        </>
    );
};
