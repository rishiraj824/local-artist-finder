import React, { memo, useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { colors } from '../theme/colors';
import { typography, fontSize } from '../theme/typography';

interface Location {
  id: number;
  city: string | null;
  state: string;
  stateCode?: string;
}

interface EventsHeaderProps {
  availableLocations: Location[];
  selectedLocation: string;
  isUsingUserLocation: boolean;
  onLocationChange: (locationId: string) => void;
  onUseMyLocation: () => void;
}

const EventsHeader = memo(({
  availableLocations,
  selectedLocation,
  isUsingUserLocation,
  onLocationChange,
  onUseMyLocation,
}: EventsHeaderProps) => {
  console.log('EventsHeader rendered');
  const [open, setOpen] = useState(false);

  // Convert locations to dropdown items format
  const items = useMemo(() => {
    return availableLocations.map((loc) => ({
      label: `${loc.city || loc.state}${loc.city && loc.stateCode ? `, ${loc.stateCode}` : ''}`,
      value: loc.id.toString(),
    }));
  }, [availableLocations]);

  return (
    <View style={styles.headerContainer}>
      <View style={styles.searchRow}>
        <View style={styles.dropdownWrapper}>
          <DropDownPicker
            open={open}
            value={selectedLocation || null}
            items={items}
            setOpen={setOpen}
            setValue={(callback) => {
              const value = typeof callback === 'function' ? callback(selectedLocation) : callback;
              if (value) {
                onLocationChange(value);
              }
            }}
            placeholder="Search city..."
            searchable={true}
            searchPlaceholder="Type to search..."
            style={[
              styles.dropdown,
              selectedLocation && styles.dropdownActive
            ]}
            textStyle={styles.dropdownText}
            dropDownContainerStyle={styles.dropDownContainer}
            searchContainerStyle={styles.searchContainer}
            searchTextInputStyle={styles.searchInput}
            placeholderStyle={styles.placeholderStyle}
            listItemContainerStyle={styles.listItemContainer}
            listItemLabelStyle={styles.listItemLabel}
            selectedItemContainerStyle={styles.selectedItemContainer}
            selectedItemLabelStyle={styles.selectedItemLabel}
            disabled={availableLocations.length === 0}
            zIndex={3000}
            zIndexInverse={1000}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.locationButton,
            isUsingUserLocation && styles.locationButtonDisabled,
          ]}
          onPress={onUseMyLocation}
          disabled={isUsingUserLocation}
        >
          <Text style={styles.locationButtonText}>📍</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

EventsHeader.displayName = 'EventsHeader';

const styles = StyleSheet.create({
  headerContainer: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 24,
    backgroundColor: colors.background,
    zIndex: 3000,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    zIndex: 3000,
  },
  dropdownWrapper: {
    flex: 1,
    zIndex: 3000,
  },
  dropdown: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
    minHeight: 50,
  },
  dropdownActive: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.surfaceLight,
  },
  dropdownText: {
    ...typography.body,
    color: colors.text,
  },
  dropDownContainer: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 4,
  },
  searchContainer: {
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    ...typography.body,
    color: colors.text,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
  },
  placeholderStyle: {
    color: colors.textSecondary,
    ...typography.body,
  },
  listItemContainer: {
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  listItemLabel: {
    ...typography.body,
    color: colors.text,
  },
  selectedItemContainer: {
    backgroundColor: colors.primary + '20',
  },
  selectedItemLabel: {
    color: colors.primary,
    fontWeight: '600',
  },
  locationButton: {
    width: 50,
    height: 50,
    backgroundColor: colors.secondary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  locationButtonDisabled: {
    backgroundColor: colors.surface,
    opacity: 0.5,
  },
  locationButtonText: {
    fontSize: 20,
  },
});

export default EventsHeader;
