import React, { useState, useRef } from "react";
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

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    const success = await login(username, password);

    if (success) {
      router.replace("/(tabs)/profile");
    } else {
      setError("❌ Username or password is wrong!");
      triggerShake();
    }

    setLoading(false);
  };

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 80,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 80,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 6,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 60,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#FFFAF0" }}
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
            color: "#FF7F50",
            fontWeight: "bold",
          }}
        >
          🐻 Welcome Back!
        </Text>

        {/* 🟥 Error Message on Top */}
        {error ? (
          <Animated.View
            style={{
              transform: [{ translateX: shakeAnim }],
              backgroundColor: "#FFE4E1",
              borderRadius: 12,
              padding: 10,
              marginBottom: 15,
              borderWidth: 1,
              borderColor: "#FF7F7F",
            }}
          >
            <Text
              style={{
                color: "#FF4500",
                textAlign: "center",
                fontWeight: "700",
              }}
            >
              {error}
            </Text>
          </Animated.View>
        ) : null}

        {/* 🧸 Input Fields with Shake Effect */}
        <Animated.View
          style={{
            transform: [{ translateX: shakeAnim }],
          }}
        >
          <TextInput
            placeholder="🐰 Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            style={{
              borderWidth: 2,
              borderColor: "#FFDAB9",
              marginBottom: 10,
              padding: 12,
              borderRadius: 12,
              fontSize: 16,
              backgroundColor: "#FFF",
            }}
          />
          <TextInput
            placeholder="🦊 Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={{
              borderWidth: 2,
              borderColor: "#FFDAB9",
              marginBottom: 10,
              padding: 12,
              borderRadius: 12,
              fontSize: 16,
              backgroundColor: "#FFF",
            }}
          />
        </Animated.View>

        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          style={{
            backgroundColor: "#FFB6C1",
            paddingVertical: 14,
            borderRadius: 16,
            alignItems: "center",
            shadowColor: "#FF69B4",
            shadowOpacity: 0.3,
            shadowRadius: 5,
          }}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={{ fontSize: 18, fontWeight: "bold", color: "#FFF" }}>
              🦄 Login
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.replace("/(auth)/register")}
          style={{
            marginTop: 25,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: "#FF7F50",
              fontSize: 16,
              fontWeight: "500",
            }}
          >
            Don’t have an account? 🐣 Register
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
