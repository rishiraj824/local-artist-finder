import React, { memo, useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { MapPin } from 'lucide-react-native';
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
    <View className="px-5 pt-2 pb-6 bg-concrete-dark" style={{ zIndex: 3000 }}>
      {/* Title */}
      <Text className="text-2xl font-black text-white tracking-wider uppercase mb-2" style={{ fontFamily: 'BlackOpsOne_400Regular' }}>
        EVENTS.DROP
      </Text>
      <View className="h-1 w-20 bg-neon-pink mb-4" style={{ shadowColor: '#ff006e', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 8 }} />

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
            placeholder="SEARCH CITY..."
            searchable={true}
            searchPlaceholder="TYPE TO SEARCH..."
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
          className={`w-12 justify-center items-center border-2 ${isUsingUserLocation ? 'bg-concrete-mid border-concrete-light opacity-50' : 'bg-neon-pink border-neon-pink'}`}
          style={isUsingUserLocation ? { height: 48 } : { height: 48, shadowColor: '#ff006e', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.6, shadowRadius: 8 }}
          onPress={onUseMyLocation}
          disabled={isUsingUserLocation}
        >
          <MapPin size={20} color={isUsingUserLocation ? '#666' : '#000'} strokeWidth={3} />
        </TouchableOpacity>
      </View>
    </View>
  );
});

EventsHeader.displayName = 'EventsHeader';

const styles = StyleSheet.create({
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
    borderRadius: 0,
    borderWidth: 2,
    borderColor: '#3a3a3a',
    backgroundColor: '#2a2a2a',
    minHeight: 48,
  },
  dropdownActive: {
    borderWidth: 2,
    borderColor: '#39ff14',
    backgroundColor: '#2a2a2a',
  },
  dropdownText: {
    fontFamily: 'CourierPrime_700Bold',
    fontSize: 14,
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  dropDownContainer: {
    backgroundColor: '#1a1a1a',
    borderColor: '#3a3a3a',
    borderWidth: 2,
    borderRadius: 0,
    marginTop: 4,
  },
  searchContainer: {
    borderBottomColor: '#3a3a3a',
    borderBottomWidth: 2,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#2a2a2a',
  },
  searchInput: {
    fontFamily: 'CourierPrime_700Bold',
    fontSize: 14,
    color: '#fff',
    borderColor: '#3a3a3a',
    backgroundColor: '#2a2a2a',
    letterSpacing: 1,
  },
  placeholderStyle: {
    color: '#666',
    fontFamily: 'CourierPrime_700Bold',
    fontSize: 14,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  listItemContainer: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
  },
  listItemLabel: {
    fontFamily: 'CourierPrime_400Regular',
    fontSize: 14,
    color: '#fff',
    letterSpacing: 0.5,
  },
  selectedItemContainer: {
    backgroundColor: '#39ff14' + '30',
  },
  selectedItemLabel: {
    color: '#39ff14',
    fontFamily: 'CourierPrime_700Bold',
    fontWeight: '700',
  },
});

export default EventsHeader;
