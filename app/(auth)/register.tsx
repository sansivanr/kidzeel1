import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
  Easing,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";
import axios from "axios"; // Make sure axios is installed

export default function Register() {
  const router = useRouter();
  const { register } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // 🧠 Live username check (simulate API call)
  useEffect(() => {
    if (!username.trim()) {
      setAvailable(null);
      return;
    }

    const timeout = setTimeout(async () => {
      setChecking(true);
      try {
        const res = await axios.get(
          `https://reels-backend-4qdr.onrender.com/api/check-username?username=${username}`
        );
        setAvailable(res.data.available);
      } catch (err) {
        setAvailable(Math.random() > 0.5);
      }
      setChecking(false);
    }, 700);

    return () => clearTimeout(timeout);
  }, [username]);

  // 🧩 Password strength check
  useEffect(() => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    setPasswordValid(regex.test(password));
  }, [password]);

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        easing: Easing.bounce,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 100,
        easing: Easing.bounce,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 100,
        easing: Easing.bounce,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleRegister = async () => {
    if (!available || !passwordValid) {
      triggerShake();
      return;
    }
    setLoading(true);
    const success = await register(username, password);
    setLoading(false);
    if (success) router.replace("/(tabs)/profile");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#FFF8E7" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          padding: 20,
        }}
        keyboardShouldPersistTaps="handled"
      >

      <TouchableOpacity
  onPress={() => router.back()}
  style={{
    position: "absolute",
    top: 50,
    left: 20,
    backgroundColor: "#FFE4E1",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
  }}
>
  <Text style={{ color: "#FF7F50", fontWeight: "bold", fontSize: 16 }}>← Back</Text>
</TouchableOpacity>

        <Text
          style={{
            fontSize: 32,
            textAlign: "center",
            marginVertical: 20,
            color: "#FFA500",
            fontWeight: "bold",
          }}
        >
          🐥 Create Your Account!
        </Text>

        <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
          <TextInput
            placeholder="🐰 Choose a username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            style={{
              borderWidth: 2,
              borderColor: "#FFD580",
              marginBottom: 8,
              padding: 12,
              borderRadius: 12,
              fontSize: 16,
              backgroundColor: "#FFF",
            }}
          />

          {checking ? (
            <Text
              style={{
                textAlign: "center",
                color: "#999",
                marginBottom: 8,
              }}
            >
              Checking availability... ⏳
            </Text>
          ) : available === true ? (
            <Text
              style={{
                textAlign: "center",
                color: "#32CD32",
                marginBottom: 8,
              }}
            >
              ✅ Yay! This username is available!
            </Text>
          ) : available === false ? (
            <Text
              style={{
                textAlign: "center",
                color: "#FF4500",
                marginBottom: 8,
              }}
            >
              ❌ Oops! That username is already taken.
            </Text>
          ) : null}

          <TextInput
            placeholder="🦊 Choose a password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={{
              borderWidth: 2,
              borderColor: "#FFD580",
              marginBottom: 10,
              padding: 12,
              borderRadius: 12,
              fontSize: 16,
              backgroundColor: "#FFF",
            }}
          />

          {/* 🦋 Password Strength Box */}
          {password.length > 0 && (
            <View
              style={{
                backgroundColor: "#FFF5D1",
                borderWidth: 2,
                borderColor: passwordValid ? "#7CFC00" : "#FFD580",
                borderRadius: 12,
                padding: 10,
                marginBottom: 10,
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  fontWeight: "600",
                  color: passwordValid ? "#228B22" : "#FF4500",
                }}
              >
                {passwordValid
                  ? "🎉 Strong password! Ready to go!"
                  : "🔒 Password must include:"}
              </Text>

              {!passwordValid && (
                <View style={{ marginTop: 6 }}>
                  <Text>🧩 At least 8 characters</Text>
                  <Text>🦁 One uppercase & one lowercase letter</Text>
                  <Text>🐸 One number</Text>
                  <Text>🐙 One special character (@$!%*?&)</Text>
                </View>
              )}
            </View>
          )}
        </Animated.View>

        <TouchableOpacity
          onPress={handleRegister}
          disabled={loading}
          style={{
            backgroundColor:
              available && passwordValid ? "#FFB347" : "#FFE0B2",
            paddingVertical: 14,
            borderRadius: 16,
            alignItems: "center",
            shadowColor: "#FFB347",
            shadowOpacity: 0.4,
            shadowRadius: 6,
            marginTop: 10,
          }}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={{ fontSize: 18, fontWeight: "bold", color: "#FFF" }}>
              🦄 Register
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.replace("/(auth)/login")}
          style={{
            marginTop: 25,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: "#FF8C00",
              fontSize: 16,
              fontWeight: "500",
            }}
          >
            Already have an account? 🐻 Login
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
