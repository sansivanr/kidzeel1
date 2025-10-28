import React from "react";
import { View, Text, TextInput, Button } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";

export default function Register() {
  const router = useRouter();
  const { register } = useAuth();
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");

  const handleRegister = async () => {
    const success = await register(username, password);
    if (success) router.replace("/(tabs)/profile");
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <Button title="← Back" onPress={() => router.back()} />

      <Text style={{ fontSize: 24, textAlign: "center", marginVertical: 20 }}>
        Register
      </Text>

      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={{ borderWidth: 1, marginBottom: 10, padding: 10, borderRadius: 8 }}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{ borderWidth: 1, marginBottom: 10, padding: 10, borderRadius: 8 }}
      />

      <Button title="Register" onPress={handleRegister} />

      <View style={{ marginTop: 20 }}>
        <Button
          title="Already have an account? Login"
          onPress={() => router.replace("/(auth)/login")}
        />
      </View>
    </View>
  );
}
