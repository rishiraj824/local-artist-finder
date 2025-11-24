import React, { memo, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, SectionList } from 'react-native';
import { EventWithTracks } from '../types';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import EventCard from './EventCard';

interface EventsListProps {
  events: EventWithTracks[];
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
}

const EventsList = memo(({
  events,
  isLoading,
  error,
  onRefresh,
  ListHeaderComponent,
}: EventsListProps) => {
  console.log('EventsList rendered with', events.length, 'events');

  // Group events by date
  const eventSections = useMemo(() => {
    const grouped: { [key: string]: EventWithTracks[] } = {};

    events.forEach((event) => {
      const dateKey = new Date(event.date).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });

    return Object.keys(grouped).map((date) => ({
      title: date,
      data: grouped[date],
    }));
  }, [events]);

  const renderSectionHeader = useCallback(
    ({ section }: { section: { title: string } }) => (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>{section.title}</Text>
      </View>
    ),
    []
  );

  const renderItem = useCallback(
    ({ item }: { item: EventWithTracks }) => <EventCard event={item} />,
    []
  );

  const renderEmpty = useCallback(() => {
    if (isLoading) {
      return null;
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {error || 'No events found in your area'}
        </Text>
      </View>
    );
  }, [isLoading, error]);

  return (
    <SectionList
      sections={eventSections}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={renderEmpty}
      contentContainerStyle={styles.listContent}
      refreshing={isLoading}
      onRefresh={onRefresh}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      stickySectionHeadersEnabled={true}
      style={styles.list}
    />
  );
});

EventsList.displayName = 'EventsList';

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 16,
  },
  sectionHeader: {
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    marginBottom: 8,
  },
  sectionHeaderText: {
    ...typography.h4,
    color: colors.text,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default EventsList;
