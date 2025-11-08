import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { VideoView, useVideoPlayer } from "expo-video";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../../src/context/AuthContext";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

type VideoItem = {
  id: string;
  s3_url: string;
  cdn_url?: string;
  title: string;
  description: string;
  uploadedBy: { username: string; profileUrl?: string | null };
  thumbnail_url: string | null;
};

type ProfileResponse = {
  user: { username: string; profileUrl: string | null };
  videos: VideoItem[];
};

function VideoPlayerModal({ visible, video, onClose }: any) {
  const [isPaused, setIsPaused] = useState(false);
  const player = useVideoPlayer(video?.cdn_url ?? video?.s3_url ?? "", (p) => {
    p.loop = true;
    if (visible) p.play();
  });

  useEffect(() => {
    if (!video) return;
    if (visible) player.play();
    else player.pause();
  }, [visible, video]);

  const togglePlayPause = () => {
    if (isPaused) player.play();
    else player.pause();
    setIsPaused(!isPaused);
  };

  if (!video) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent={false}>
      <TouchableOpacity
        style={styles.fullscreenContainer}
        activeOpacity={1}
        onPress={togglePlayPause}
      >
        <VideoView
          style={styles.fullscreenVideo}
          player={player}
          contentFit="cover"
          allowsFullscreen
        />
        {isPaused && (
          <View style={styles.overlay}>
            <Text style={styles.playIcon}>▶</Text>
          </View>
        )}
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.videoCaption}>
          <Text style={styles.captionTitle}>{video.title}</Text>
          <Text style={styles.captionDesc}>{video.description}</Text>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

export default function ProfileScreen() {
  const { user: authUser, logout } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  

  const fetchProfile = useCallback(async () => {
    if (!authUser) return;
    setLoading(true);
    try {
      const res = await axios.get<ProfileResponse>(
        `https://reels-backend-4qdr.onrender.com/api/users/${authUser.id}/profile`
      );
      setProfile(res.data);
    } catch (err) {
      console.error("Error fetching profile:", err);
      Alert.alert("Oops!", "Could not load your profile right now 💔");
    } finally {
      setLoading(false);
    }
  }, [authUser]);

  /** 🍭 Pull-to-refresh handler */
const onRefresh = useCallback(async () => {
  setRefreshing(true);
  await fetchProfile();
  setRefreshing(false);
}, [fetchProfile]);


  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (!authUser) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={["#FFD1DC", "#FFB6C1", "#FFF0F5"]} style={styles.flexFill}>
          <View style={styles.centered}>
            <Text style={styles.notLoggedText}>You’re not logged in 🍭</Text>
            <TouchableOpacity
              onPress={() => router.push("/(auth)/login")}
              style={[styles.button, { backgroundColor: "#FF9EC4" }]}
            >
              <Text style={styles.buttonText}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/(auth)/register")}
              style={[styles.button, { backgroundColor: "#FFD1DC", marginTop: 10 }]}
            >
              <Text style={[styles.buttonText, { color: "#FF6FB5" }]}>Register</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (!profile && loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={["#FFD1DC", "#FFB6C1", "#FFF0F5"]} style={styles.flexFill}>
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#FF6FB5" />
            <Text style={styles.loadingText}>Loading your sweet profile 🍬</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  const { user, videos } = profile || {};

  return ( 
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#FFD1DC", "#FFB6C1", "#FFF0F5"]} style={styles.flexFill}>
        {/* 🍭 Header */}
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <Image
              source={{
                uri:
                  user?.profileUrl ||
                  "https://cdn-icons-png.flaticon.com/512/149/149071.png",
              }}
              style={styles.profileUrl}
            />
            <View style={{ marginLeft: 14 }}>
              <Text style={styles.username}>@{user?.username}</Text>
              <Text style={styles.stats}>🍩 Posts: {videos?.length}</Text>
            </View>
          </View>

          <TouchableOpacity onPress={logout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>🚪 Logout</Text>
          </TouchableOpacity>
        </View>

        {/* 🍡 Video Grid */}
        <FlatList
          data={videos}
          numColumns={3}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.thumbnailContainer}
              activeOpacity={0.85}
              onPress={() => {
                setSelectedVideo(item);
                setModalVisible(true);
              }}
            >
              <Image
                source={{
                  uri:
                    item.thumbnail_url ||
                    "https://cdn.pixabay.com/photo/2024/07/20/17/12/warning-8908707_1280.png",
                }}
                style={styles.thumbnail}
              />
            </TouchableOpacity>
          )}
          contentContainerStyle={
            videos?.length === 0
              ? styles.centered
              : { flexGrow: 1, paddingHorizontal: 6, paddingBottom: 90 }
          }
          ListEmptyComponent={
            loading
              ? null
              : (
                <View style={styles.centered}>
                  <Text style={styles.emptyText}>No sweet uploads yet 🍬</Text>
                  <TouchableOpacity
                    onPress={() => router.push("/(tabs)/upload")}
                    style={[styles.button, { marginTop: 12 }]}
                  >
                    <Text style={styles.buttonText}>Upload Now 🍓</Text>
                  </TouchableOpacity>
                </View>
              )
          }
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}       // ✅ NEW
  onRefresh={onRefresh}         // ✅ NEW
        />

        <VideoPlayerModal
          visible={modalVisible}
          video={selectedVideo}
          onClose={() => {
            setModalVisible(false);
            setSelectedVideo(null);
          }}
        />
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF0F5" },
  flexFill: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    backgroundColor: "rgba(96, 20, 108, 0)",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "rgba(255,182,193,0.6)",
  },
  profileSection: { flexDirection: "row", alignItems: "center" },
  profileUrl: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: "#FFB6C1",
  },
  username: { color: "#ff00c3ff", fontSize: 20, fontWeight: "700" },
  stats: { color: "#000000ff", fontSize: 14, fontWeight: "600", marginTop: 4 },
  logoutButton: {
    backgroundColor: "#FF6FB5",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  logoutText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  thumbnailContainer: {
    flex: 1 / 3,
    aspectRatio: 1,
    margin: 4,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "#FFD1DC",
    backgroundColor: "#FFF",
  },
  thumbnail: { width: "100%", height: "100%" },
  button: {
    backgroundColor: "#FF6FB5",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#FFB6C1",
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  loadingText: {
    color: "#FF6FB5",
    marginTop: 10,
    fontWeight: "600",
    fontSize: 16,
  },
  notLoggedText: { color: "#FF6FB5", fontSize: 18, marginBottom: 16 },
  emptyText: { color: "#FF6FB5", fontSize: 16, textAlign: "center" },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  fullscreenVideo: { width: screenWidth, height: screenHeight },
  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  playIcon: { fontSize: 72, color: "#fff" },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "rgba(255,192,203,0.7)",
    padding: 8,
    borderRadius: 20,
  },
  closeText: { color: "#fff", fontSize: 18 },
  videoCaption: { position: "absolute", bottom: 60, left: 20, right: 20 },
  captionTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
  captionDesc: { color: "#eee", marginTop: 4, fontSize: 14 },
});
