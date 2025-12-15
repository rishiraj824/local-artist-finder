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
      <View className="bg-concrete-dark px-4 py-3 pb-4 border-b-2 border-neon-green mb-2">
        <Text className="text-white text-xl font-black uppercase tracking-wide" style={{ fontFamily: 'BlackOpsOne_400Regular' }}>
          {section.title}
        </Text>
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
      <View className="p-8 items-center">
        <Text className="text-gray-400 text-base text-center tracking-wide" style={{ fontFamily: 'CourierPrime_400Regular' }}>
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
      className="flex-1 bg-concrete-dark"
      contentContainerStyle={styles.listContent}
    />
  );
});

EventsList.displayName = 'EventsList';

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 16,
  },
});

export default EventsList;
