import { useState, useEffect } from 'react';
import { Platform, Alert } from 'react-native';
import NfcManager, { NfcTech, Ndef } from 'react-native-nfc-manager';

export const useNFC = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [isWriting, setIsWriting] = useState(false);

  useEffect(() => {
    checkNFCSupport();
    return () => {
      cleanup();
    };
  }, []);

  const checkNFCSupport = async () => {
    try {
      const supported = await NfcManager.isSupported();
      setIsSupported(supported);

      if (supported) {
        await NfcManager.start();
        const enabled = await NfcManager.isEnabled();
        setIsEnabled(enabled);
      }

      console.log('[useNFC] NFC Support:', supported, '| Enabled:', enabled);
    } catch (error) {
      console.error('[useNFC] Error checking NFC support:', error);
      setIsSupported(false);
      setIsEnabled(false);
    }
  };

  const cleanup = async () => {
    try {
      await NfcManager.cancelTechnologyRequest();
    } catch (error) {
      console.log('[useNFC] Cleanup error (can be ignored):', error);
    }
  };

  const writeNFC = async (userId: string): Promise<boolean> => {
    if (!isSupported) {
      Alert.alert('NFC Not Supported', 'Your device does not support NFC.');
      return false;
    }

    if (!isEnabled) {
      Alert.alert('NFC Disabled', 'Please enable NFC in your device settings.');
      return false;
    }

    try {
      setIsWriting(true);
      console.log('[useNFC] Starting NFC write for userId:', userId);

      // Request NFC technology
      await NfcManager.requestTechnology(NfcTech.Ndef);

      // Create NDEF message with user ID
      const bytes = Ndef.encodeMessage([Ndef.textRecord(userId)]);

      if (bytes) {
        await NfcManager.ndefHandler.writeNdefMessage(bytes);
        console.log('[useNFC] Successfully wrote NFC tag');
        Alert.alert('Success!', 'Your profile has been written to the NFC tag.');
        return true;
      }

      return false;
    } catch (error) {
      console.error('[useNFC] Error writing NFC:', error);
      Alert.alert('Write Failed', 'Could not write to NFC tag. Please try again.');
      return false;
    } finally {
      setIsWriting(false);
      await cleanup();
    }
  };

  const readNFC = async (): Promise<string | null> => {
    if (!isSupported) {
      Alert.alert('NFC Not Supported', 'Your device does not support NFC.');
      return null;
    }

    if (!isEnabled) {
      Alert.alert('NFC Disabled', 'Please enable NFC in your device settings.');
      return null;
    }

    try {
      setIsReading(true);
      console.log('[useNFC] Starting NFC read...');

      // Request NFC technology
      await NfcManager.requestTechnology(NfcTech.Ndef);

      // Read NDEF message
      const tag = await NfcManager.getTag();
      console.log('[useNFC] NFC Tag detected:', tag);

      if (tag && tag.ndefMessage && tag.ndefMessage.length > 0) {
        const ndefRecord = tag.ndefMessage[0];
        const userId = Ndef.text.decodePayload(ndefRecord.payload as number[]);
        console.log('[useNFC] Successfully read userId:', userId);
        return userId;
      }

      Alert.alert('Invalid Tag', 'This NFC tag does not contain a valid user profile.');
      return null;
    } catch (error: any) {
      console.error('[useNFC] Error reading NFC:', error);

      // Don't show alert if user cancelled
      if (error.message && error.message.includes('cancelled')) {
        console.log('[useNFC] NFC read cancelled by user');
      } else {
        Alert.alert('Read Failed', 'Could not read NFC tag. Please try again.');
      }

      return null;
    } finally {
      setIsReading(false);
      await cleanup();
    }
  };

  const startNFCSession = async (onTagRead: (userId: string) => void) => {
    if (!isSupported || !isEnabled) {
      return;
    }

    try {
      setIsReading(true);
      await NfcManager.requestTechnology(NfcTech.Ndef);

      // Set up tag event listener
      NfcManager.setEventListener('NfcManagerDiscoverTag', async (tag) => {
        console.log('[useNFC] Tag discovered:', tag);

        if (tag && tag.ndefMessage && tag.ndefMessage.length > 0) {
          const ndefRecord = tag.ndefMessage[0];
          const userId = Ndef.text.decodePayload(ndefRecord.payload as number[]);

          if (userId) {
            onTagRead(userId);
          }
        }

        await cleanup();
        setIsReading(false);
      });
    } catch (error) {
      console.error('[useNFC] Error starting NFC session:', error);
      setIsReading(false);
      await cleanup();
    }
  };

  const stopNFCSession = async () => {
    try {
      await cleanup();
      NfcManager.setEventListener('NfcManagerDiscoverTag', null);
      setIsReading(false);
    } catch (error) {
      console.error('[useNFC] Error stopping NFC session:', error);
    }
  };

  return {
    isSupported,
    isEnabled,
    isReading,
    isWriting,
    writeNFC,
    readNFC,
    startNFCSession,
    stopNFCSession,
  };
};
