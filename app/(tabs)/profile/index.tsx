import React from "react";
import { View, Text, Button } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../../src/context/AuthContext";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  if (!user) {
    // Not logged in → show login/register buttons
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 18, marginBottom: 20 }}>You’re not logged in</Text>
        <Button title="Sign In" onPress={() => router.push("/(auth)/login")} />
        <View style={{ marginTop: 10 }}>
          <Button title="Register" onPress={() => router.push("/(auth)/register")} />
        </View>
      </View>
    );
  }

  // Logged in → show profile info
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 20, marginBottom: 10 }}>Welcome, {user.username}</Text>
      <Button title="Logout" onPress={logout} />
    </View>
  );
}
