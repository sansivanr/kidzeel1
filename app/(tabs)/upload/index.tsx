import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Button,
  Animated, 
  Easing,
  Keyboard,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import { useAuth } from "../../../src/context/AuthContext";

export default function Upload() {
  const { user } = useAuth();
  const router = useRouter();
  const [video, setVideo] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [tickAnim] = useState(new Animated.Value(0));

  const API_BASE = "https://reels-backend-4qdr.onrender.com";

  const pickVideo = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({ type: "video/*" });
    if (result.assets?.length) {
      const file = result.assets[0];
      const sizeInMB = typeof file.size === "number" ? file.size / (1024 * 1024) : null;

      if (sizeInMB !== null && sizeInMB > 10) {
        Alert.alert(
          "File too large",
          `Your video is ${sizeInMB.toFixed(2)} MB. The maximum allowed size is 10 MB.`
        );
        return; // stop here, don’t save it
      }

      setVideo(file);
    }
  } catch (err) {
    console.error("Pick error:", err);
    Alert.alert("Error", "Could not select video");
  }
};


  const handleUpload = async () => {
  Keyboard.dismiss();
  if (!video) return Alert.alert("Error", "Please select a video first");
  if (!title.trim()) return Alert.alert("Error", "Please enter a title");

  try {
    setLoading(true);
    setStatus("Analyzing for unsafe content...");

    // 🔍 Step 1: Moderation check
    const formData1 = new FormData();
    formData1.append("video", {
      uri: video.uri,
      name: video.name || "upload.mp4",
      type: video.mimeType || "video/mp4",
    } as any);

    const modRes = await axios.post(`${API_BASE}/api/upload`, formData1, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const flagged = Object.values(modRes.data.flags || {}).some(Boolean);
    if (flagged) {
      setLoading(false);
      return Alert.alert(
        "❌ Unsafe Content",
        "Your video contains restricted material."
      );
    }

    // ✅ Safe Content — Animate Tick
    setStatus("✅ Safe content verified!");
    Animated.sequence([
      Animated.timing(tickAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.delay(900), // pause with tick visible
      Animated.timing(tickAnim, {
        toValue: 0,
        duration: 400,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();

    await new Promise((resolve) => setTimeout(resolve, 1500)); // wait total 1.5s before upload

    // 📤 Step 2: Upload video
    setStatus("Uploading video...");
    const token = await AsyncStorage.getItem("token");

    const formData2 = new FormData();
    formData2.append("video", {
      uri: video.uri,
      name: video.name || "upload.mp4",
      type: video.mimeType || "video/mp4",
    } as any);
    formData2.append("title", title);
    formData2.append("description", description);

    const uploadRes = await axios.post(`${API_BASE}/api/test-upload`, formData2, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });

    Alert.alert("✅ Success", "Your video was uploaded successfully!");
    console.log("Upload response:", uploadRes.data);

    setVideo(null);
    setTitle("");
    setDescription("");
    router.push("/(tabs)/reels");
  } catch (err: any) {
    console.error("Upload error:", err.response?.data || err.message);
    Alert.alert("Error", "Upload failed. Please try again.");
  } finally {
    setLoading(false);
    setStatus("");
  }
};


  if (!user) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white", // optional: makes it look cleaner
      }}
    >
      <Text style={{ fontSize: 16, marginBottom: 16, textAlign: "center" }}>
        You must log in to upload videos.
      </Text>
      <Button
        title="Go to Login"
        onPress={() => router.push("/(auth)/login")}
      />
    </View>
  );
}


  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#000",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <Text style={{ color: "white", fontSize: 22, fontWeight: "bold", marginBottom: 20 }}>
        Upload Video
      </Text>

      {/* Select Video */}
      <TouchableOpacity
        onPress={pickVideo}
        style={{
          backgroundColor: "#1E1E1E",
          padding: 15,
          borderRadius: 10,
          marginBottom: 15,
          width: "100%",
        }}
      >
        <Text style={{ color: "white", textAlign: "center" }}>
          {video ? `Selected: ${video.name}` : "Select Video"}
        </Text>
      </TouchableOpacity>

      {/* Title */}
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Title"
        placeholderTextColor="#888"
        style={{
          backgroundColor: "#1E1E1E",
          color: "white",
          borderRadius: 8,
          padding: 10,
          marginBottom: 10,
          width: "100%",
        }}
      />

      {/* Description */}
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="Description"
        placeholderTextColor="#888"
        style={{
          backgroundColor: "#1E1E1E",
          color: "white",
          borderRadius: 8,
          padding: 10,
          marginBottom: 20,
          width: "100%",
        }}
        multiline
      />

      {/* Loader or Button */}
      {loading ? (
  <View style={{ alignItems: "center" }}>
    {status.includes("✅") ? (
      <Animated.View
        style={{
          opacity: tickAnim,
          transform: [
            {
              scale: tickAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.5, 1.5],
              }),
            },
          ],
        }}
      >
        <Text style={{ fontSize: 48, color: "limegreen" }}>✅</Text>
      </Animated.View>
    ) : (
      <ActivityIndicator size="large" color="#fff" />
    )}
    <Text style={{ color: "white", marginTop: 10 }}>{status}</Text>
  </View>
) : (
  <TouchableOpacity
    onPress={handleUpload}
    style={{
      backgroundColor: "#007AFF",
      padding: 15,
      borderRadius: 10,
      width: "100%",
    }}
  >
    <Text
      style={{ color: "white", textAlign: "center", fontWeight: "bold" }}
    >
      Upload
    </Text>
  </TouchableOpacity>
)}
    </View>
  );
}
