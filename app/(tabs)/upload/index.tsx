import { View, Text, Button } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../../src/context/AuthContext";

export default function Upload() {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>You must log in to upload videos.</Text>
        <Button title="Go to Login" onPress={() => router.push("/(auth)/login")} />
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center">
      <Text>Welcome {user.username}, upload your video here!</Text>
    </View>
  );
}
