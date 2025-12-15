import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useNavigation } from '@react-navigation/native';
import { X, Scan } from 'lucide-react-native';

export default function ScanScreen() {
  const navigation = useNavigation<any>();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;

    setScanned(true);
    setScanning(true);

    console.log('[ScanScreen] QR Code scanned:', data);

    // Navigate to VibeCheck screen with the scanned user ID
    setTimeout(() => {
      navigation.navigate('VibeCheck', { scannedUserId: data });
      setScanned(false);
      setScanning(false);
    }, 500);
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView className="flex-1 bg-concrete-dark justify-center items-center">
        <Text
          className="text-white text-base font-bold"
          style={{ fontFamily: 'CourierPrime_700Bold' }}
        >
          REQUESTING CAMERA PERMISSION...
        </Text>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView className="flex-1 bg-concrete-dark justify-center items-center px-6">
        <Text
          className="text-neon-pink text-lg font-black text-center mb-4"
          style={{ fontFamily: 'BlackOpsOne_400Regular' }}
        >
          CAMERA ACCESS DENIED
        </Text>
        <Text
          className="text-white text-sm text-center mb-6"
          style={{ fontFamily: 'CourierPrime_400Regular' }}
        >
          Please enable camera access in your device settings to scan QR codes.
        </Text>
        <TouchableOpacity
          className="bg-neon-green border-4 border-black px-6 py-3"
          onPress={() => navigation.goBack()}
        >
          <Text
            className="text-black text-sm font-black"
            style={{ fontFamily: 'CourierPrime_700Bold' }}
          >
            GO BACK
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-black">
      {/* Camera View */}
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Overlay */}
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="flex-row justify-between items-center px-5 py-4 bg-black/50">
          <View>
            <Text
              className="text-white text-2xl font-black tracking-wide"
              style={{ fontFamily: 'BlackOpsOne_400Regular' }}
            >
              SCAN MODE
            </Text>
            <Text
              className="text-neon-green text-xs font-bold mt-1"
              style={{ fontFamily: 'CourierPrime_700Bold' }}
            >
              FIND YOUR VIBE
            </Text>
          </View>
          <TouchableOpacity
            className="w-12 h-12 bg-concrete-dark border-2 border-white items-center justify-center"
            onPress={() => navigation.goBack()}
          >
            <X size={24} color="#fff" strokeWidth={3} />
          </TouchableOpacity>
        </View>

        {/* Scanning Frame */}
        <View className="flex-1 justify-center items-center">
          <View className="relative">
            {/* Corner borders for scanning frame */}
            <View
              className="border-4 border-neon-green"
              style={{
                width: 280,
                height: 280,
                borderRadius: 20,
                opacity: 0.8,
              }}
            />

            {/* Animated scanning line */}
            {!scanned && (
              <View
                className="absolute w-full h-1 bg-neon-green"
                style={{
                  top: '50%',
                  opacity: 0.8,
                  shadowColor: '#39ff14',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 1,
                  shadowRadius: 10,
                }}
              />
            )}

            {/* Scan icon */}
            <View className="absolute inset-0 justify-center items-center">
              <Scan
                size={80}
                color={scanning ? "#39ff14" : "#ffffff"}
                strokeWidth={2}
                style={{ opacity: 0.5 }}
              />
            </View>
          </View>

          {/* Instructions */}
          <View className="mt-8 bg-black/70 px-6 py-4 border-2 border-neon-green mx-5">
            <Text
              className="text-white text-sm text-center font-bold"
              style={{ fontFamily: 'CourierPrime_700Bold' }}
            >
              {scanning ? 'PROCESSING...' : 'ALIGN QR CODE WITHIN FRAME'}
            </Text>
            <Text
              className="text-gray-400 text-xs text-center mt-2"
              style={{ fontFamily: 'CourierPrime_400Regular' }}
            >
              {scanning ? 'Calculating vibe compatibility...' : 'Position the code in the center'}
            </Text>
          </View>
        </View>

        {/* Bottom Tips */}
        <View className="px-5 pb-6 bg-black/50">
          <View className="bg-concrete-dark border-2 border-neon-pink p-4">
            <Text
              className="text-neon-pink text-xs font-black mb-2"
              style={{ fontFamily: 'CourierPrime_700Bold' }}
            >
              💡 TIPS
            </Text>
            <Text
              className="text-white text-xs leading-5"
              style={{ fontFamily: 'CourierPrime_400Regular' }}
            >
              • Hold steady for best results{'\n'}
              • Ensure good lighting{'\n'}
              • Keep QR code flat and unobstructed
            </Text>
          </View>
        </View>
      </SafeAreaView>

      {/* Tap anywhere to rescan */}
      {scanned && !scanning && (
        <TouchableOpacity
          className="absolute inset-0 bg-black/50 justify-center items-center"
          onPress={() => setScanned(false)}
        >
          <Text
            className="text-neon-green text-lg font-black"
            style={{ fontFamily: 'CourierPrime_700Bold' }}
          >
            TAP TO SCAN AGAIN
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
