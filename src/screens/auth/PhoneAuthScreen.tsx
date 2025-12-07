import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { authService } from "../../services/authService";
import {
  googleSignIn,
  configureGoogleSignIn,
} from "../../services/googleSignIn";
import * as AppleAuthentication from "expo-apple-authentication";

interface PhoneAuthScreenProps {
  onCodeSent: (phoneNumber: string) => void;
  onAuthenticated?: () => void;
}

export default function PhoneAuthScreen({
  onCodeSent,
  onAuthenticated,
}: PhoneAuthScreenProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAppleSignInAvailable, setIsAppleSignInAvailable] = useState(false);

  useEffect(() => {
    // Configure Google Sign-In
    configureGoogleSignIn();

    // Check if Apple Sign-In is available
    if (Platform.OS === "ios") {
      AppleAuthentication.isAvailableAsync().then(setIsAppleSignInAvailable);
    }
  }, []);

  const formatPhoneNumber = (text: string) => {
    // Remove all non-digit characters
    const cleaned = text.replace(/\D/g, "");

    // Format as (XXX) XXX-XXXX
    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 6) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    } else {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
        6,
        10
      )}`;
    }
  };

  const getCleanedPhoneNumber = (formatted: string): string => {
    const cleaned = formatted.replace(/\D/g, "");
    // Add +1 for US numbers
    return cleaned.length === 10 ? `+1${cleaned}` : `+${cleaned}`;
  };

  const handleSendCode = async () => {
    if (phoneNumber.replace(/\D/g, "").length < 10) {
      Alert.alert("Invalid Phone Number", "Please enter a valid phone number");
      return;
    }

    setLoading(true);
    try {
      const cleanedPhone = getCleanedPhoneNumber(phoneNumber);
      await authService.sendVerificationCode(cleanedPhone);
      onCodeSent(cleanedPhone);
    } catch (error: any) {
      console.error("Error sending verification code:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to send verification code. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    setPhoneNumber(formatted);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      console.log("🔵 Starting Google Sign-In flow...");

      // Step 1: Get Google ID token
      let idToken: string;
      try {
        console.log("🔵 Calling googleSignIn()...");
        idToken = await googleSignIn();
        console.log("✅ Google ID Token received:", idToken);
      } catch (tokenError: any) {
        console.error("❌ Failed to get Google ID token:", {
          message: tokenError.message,
          code: tokenError.code,
          stack: tokenError.stack,
          fullError: JSON.stringify(tokenError, null, 2),
        });
        throw new Error(`Failed to get Google token: ${tokenError.message}`);
      }

      // Step 2: Sign in with Firebase using the ID token
      try {
        console.log("🔵 Calling authService.signInWithGoogle()...");
        await authService.signInWithGoogle(idToken);
        console.log("✅ Firebase sign-in successful");
      } catch (authError: any) {
        console.error("❌ Failed to sign in with Firebase:", {
          message: authError.message,
          code: authError.code,
          stack: authError.stack,
          fullError: JSON.stringify(authError, null, 2),
        });
        throw new Error(`Failed to authenticate with Firebase: ${authError.message}`);
      }

      // Step 3: Complete authentication
      console.log("✅ Calling onAuthenticated callback");
      onAuthenticated?.();
    } catch (error: any) {
      console.error("❌ Google Sign-In error (final catch):", {
        message: error.message,
        code: error.code,
        stack: error.stack,
        fullError: JSON.stringify(error, null, 2),
      });
      Alert.alert("Error", error.message || "Failed to sign in with Google");
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setLoading(true);
    try {
      await authService.signInWithApple();
      onAuthenticated?.();
    } catch (error: any) {
      console.error("Apple Sign-In error:", error);
      if (error.message !== "Apple Sign-In was cancelled") {
        Alert.alert("Error", error.message || "Failed to sign in with Apple");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.emoji}>🎵</Text>
          <Text style={styles.title}>Local Artist Finder</Text>
          <Text style={styles.subtitle}>
            Discover live music events in your area
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Enter your phone number</Text>
          <Text style={styles.description}>
            We'll send you a verification code to sign in
          </Text>

          <TextInput
            style={styles.input}
            placeholder="(555) 123-4567"
            placeholderTextColor={colors.textTertiary}
            value={phoneNumber}
            onChangeText={handlePhoneChange}
            keyboardType="phone-pad"
            maxLength={14} // (XXX) XXX-XXXX
            autoFocus
            editable={!loading}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSendCode}
            disabled={loading || phoneNumber.replace(/\D/g, "").length < 10}
          >
            {loading ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <Text style={styles.buttonText}>Send Verification Code</Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Sign-In Button */}
          <TouchableOpacity
            style={[
              styles.socialButton,
              styles.googleButton,
              loading && styles.buttonDisabled,
            ]}
            onPress={handleGoogleSignIn}
            disabled={loading}
          >
            <Text style={styles.socialButtonIcon}>G</Text>
            <Text style={styles.socialButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          {/* Apple Sign-In Button (iOS only) */}
          {isAppleSignInAvailable && (
            <TouchableOpacity
              style={[
                styles.socialButton,
                styles.appleButton,
                loading && styles.buttonDisabled,
              ]}
              onPress={handleAppleSignIn}
              disabled={loading}
            >
              <Text style={styles.socialButtonIcon}></Text>
              <Text style={styles.socialButtonText}>Continue with Apple</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.terms}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 48,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
  },
  form: {
    width: "100%",
  },
  label: {
    ...typography.h3,
    color: colors.text,
    marginBottom: 8,
  },
  description: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    ...typography.button,
    color: colors.text,
  },
  terms: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: "center",
    lineHeight: 18,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginHorizontal: 16,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  googleButton: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  appleButton: {
    backgroundColor: "#000000",
    borderColor: "#000000",
  },
  socialButtonIcon: {
    fontSize: 20,
    marginRight: 12,
    fontWeight: "600",
  },
  socialButtonText: {
    ...typography.button,
    color: colors.text,
  },
});
