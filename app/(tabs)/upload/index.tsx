/* 🎬 Upload Screen — Vibrant + Smart Thumbnail Picker */
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as VideoThumbnails from "expo-video-thumbnails";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Image,
  Keyboard,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
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

  // 🆕 Thumbnail system
  const [showThumbnailPicker, setShowThumbnailPicker] = useState(false);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [frames, setFrames] = useState<string[]>([]);

  const API_BASE = "https://reels-backend-4qdr.onrender.com";

  // 🌀 Animate checkmark
  const playTickAnim = () => {
    Animated.sequence([
      Animated.timing(tickAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.delay(1000),
      Animated.timing(tickAnim, {
        toValue: 0,
        duration: 400,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  };

  // 🎥 Pick a video
  const pickVideo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: "video/*" });
      if (result.assets?.length) {
        const file = result.assets[0];
        const sizeInMB = file.size ? file.size / (1024 * 1024) : null;
        if (sizeInMB && sizeInMB > 15) {
          return Alert.alert("File too large", "Please select a video under 15MB.");
        }
        setVideo(file);

        // 🪄 Auto-generate 4 random frames
        const newFrames: string[] = [];
        for (let i = 1000; i <= 4000; i += 1000) {
          try {
            const { uri } = await VideoThumbnails.getThumbnailAsync(file.uri, { time: i });
            newFrames.push(uri);
          } catch (e) {
            console.warn("Frame error:", e);
          }
        }
        if (newFrames.length > 0) {
          setFrames(newFrames);
          setThumbnail(newFrames[1]); // pick a middle frame automatically
        }
      }
    } catch (err) {
      console.error("Pick error:", err);
    }
  };

  // 📤 Upload Flow
  const handleUpload = async () => {
    Keyboard.dismiss();
    if (!video) return Alert.alert("Error", "Please select a video first");
    if (!title.trim()) return Alert.alert("Error", "Please enter a title");

    try {
      setLoading(true);
      setStatus("Analyzing content...");

      // 1️⃣ Moderation check
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
        return Alert.alert("❌ Unsafe", "Your video contains restricted content.");
      }

      // ✅ Safe content
      setStatus("✅ Safe content verified!");
      playTickAnim();

      await new Promise((r) => setTimeout(r, 1500));
      setShowThumbnailPicker(true);
      setLoading(false);
      setStatus("");
    } catch (err) {
      console.error("Upload error:", err);
      Alert.alert("Error", "Upload failed. Try again.");
    } finally {
      setLoading(false);
      setStatus("");
    }
  };

  // 📸 Allow user to pick custom image
  const pickCustomThumbnail = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      setThumbnail(result.assets[0].uri);
    }
  };

  // 🚀 Final upload
  const uploadWithThumbnail = async () => {
    try {
      setShowThumbnailPicker(false);
      setLoading(true);
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
      if (thumbnail) {
        formData2.append("thumbnail", {
          uri: thumbnail,
          name: "thumbnail.jpg",
          type: "image/jpeg",
        } as any);
      }

      const res = await axios.post(`${API_BASE}/api/test-upload`, formData2, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      Alert.alert("✅ Success", "Video uploaded successfully!");
      setVideo(null);
      setTitle("");
      setDescription("");
      setThumbnail(null);
      router.push("/(tabs)/reels");
    } catch (err) {
      console.error("Upload error:", err);
      Alert.alert("Error", "Upload failed. Try again.");
    } finally {
      setLoading(false);
      setStatus("");
    }
  };

  if (!user) {
  return (
    <LinearGradient
      colors={["#FFD1DC", "#FFB6C1", "#FFF0F5"]}
      style={styles.center}
    >
      <Text style={styles.header}>🍩 Welcome to kidzeel</Text>
      <Text style={[styles.loginText, { marginBottom: 20 }]}>
        You need to log in to upload your tasty creations 💕
      </Text>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#FF9EC4", width: "80%" }]}
        onPress={() => router.push("/(auth)/login")}
      >
        <Text style={styles.buttonText}>🍬 Go to Login</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}


  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <LinearGradient
        colors={["#FFD1DC", "#FFB6C1", "#FFF0F5"]}
        style={{ flex: 1, padding: 20, justifyContent: "center" }}
      >
        <Text style={styles.header}>🍭 Upload Your Sweet Reel</Text>

        {/* Video Picker */}
        <TouchableOpacity style={styles.field} onPress={pickVideo}>
          <Text style={styles.fieldText}>
            {video ? `🎞️ ${video.name}` : "Select a Yummy Video 🍬"}
          </Text>
        </TouchableOpacity>

        {/* Title */}
        <TextInput
          style={styles.input}
          placeholder="Title"
          placeholderTextColor="#ffffffff"
          value={title}
          onChangeText={setTitle}
          returnKeyType="done"
          onSubmitEditing={Keyboard.dismiss}
        />

        {/* Description */}
        <TextInput
          style={[styles.input, { height: 80 }]}
          placeholder="Description"
          placeholderTextColor="#ffffffff"
          value={description}
          onChangeText={setDescription}
          multiline
          blurOnSubmit={true}
          returnKeyType="done"
          onSubmitEditing={Keyboard.dismiss}
        />

        {/* Upload Button */}
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
                <Text style={{ fontSize: 48, color: "#90EE90" }}>✅</Text>
              </Animated.View>
            ) : (
              <ActivityIndicator size="large" color="#FF6FB5" />
            )}
            <Text style={{ color: "#fff", marginTop: 10 }}>{status}</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleUpload}>
            <Text style={styles.buttonText}>🍡 Upload</Text>
          </TouchableOpacity>
        )}

        {/* 🖼️ Thumbnail Picker Modal */}
        <Modal visible={showThumbnailPicker} animationType="slide">
          <LinearGradient
            colors={["#FFB6C1", "#FFD1DC", "#FFF0F5"]}
            style={{ flex: 1, padding: 15 }}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 22,
                marginBottom: 10,
                textAlign: "center",
              }}
            >
              🎨 Pick Your Thumbnail
            </Text>

            {thumbnail && (
              <Image
                source={{ uri: thumbnail }}
                style={{
                  width: "100%",
                  height: 250,
                  borderRadius: 16,
                  marginBottom: 10,
                  borderWidth: 2,
                  borderColor: "#FFB6C1",
                }}
              />
            )}

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {frames.map((frame, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => setThumbnail(frame)}
                  style={{
                    borderWidth: thumbnail === frame ? 3 : 0,
                    borderColor: "#FF6FB5",
                    borderRadius: 10,
                    marginRight: 10,
                    overflow: "hidden",
                  }}
                >
                  <Image
                    source={{ uri: frame }}
                    style={{ width: 100, height: 100, borderRadius: 10 }}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#FF9EC4", marginTop: 20 }]}
              onPress={pickCustomThumbnail}
            >
              <Text style={styles.buttonText}>🖼️ Upload Custom Image</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#90EE90", marginTop: 10 }]}
              onPress={uploadWithThumbnail}
            >
              <Text style={[styles.buttonText, { color: "#000" }]}>
                Continue Upload ✅
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </Modal>
      </LinearGradient>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loginText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 16,
  },
  header: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 20,
    textAlign: "center",
    textShadowColor: "rgba(255, 182, 193, 0.6)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  field: {
    backgroundColor: "rgba(255,255,255,0.25)",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: "rgba(255,182,193,0.6)",
  },
  fieldText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 12,
    color: "#fff",
    fontWeight: "600",
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,182,193,0.8)",
    shadowColor: "#FFB6C1",
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 4,
  },
  button: {
    backgroundColor: "#FF6FB5",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#FFB6C1",
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 6,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
