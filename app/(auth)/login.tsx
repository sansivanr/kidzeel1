import React from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");

  const handleLogin = async () => {
  console.log("🟢 Login button pressed"); // confirm button works
  const success = await login(username, password);
  console.log("🟢 Login finished:", success);

  if (success) {
    console.log("✅ Redirecting to profile tab...");
    router.replace("/(tabs)/profile");
  } else {
    console.log("❌ Login failed");
  }
};


  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <Button title="← Back" onPress={() => router.back()} />

      <Text style={{ fontSize: 24, textAlign: "center", marginVertical: 20 }}>
        Sign In
      </Text>

      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          marginBottom: 10,
          padding: 10,
          borderRadius: 8,
        }}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          marginBottom: 10,
          padding: 10,
          borderRadius: 8,
        }}
      />

      <Button title="Login" onPress={handleLogin} />

      <View style={{ marginTop: 20 }}>
        <Button
          title="Don't have an account? Register"
          onPress={() => router.replace("/(auth)/register")}
        />
      </View>
    </View>
  );
}
