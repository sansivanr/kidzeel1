import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import { useRouter } from "expo-router";
import { useAuth } from "../../../src/context/AuthContext";
import { VideoView, useVideoPlayer } from "expo-video";
import * as VideoThumbnails from "expo-video-thumbnails";

const { width, height } = Dimensions.get("window");

type VideoItem = {
  id: string;
  s3_url: string;
  title: string;
  description: string;
  uploadedBy: { username: string; profilePic?: string | null };
  thumbnail?: string | null; // 👈 added
};

type ProfileResponse = {
  user: { username: string; profilePic: string | null };
  videos: VideoItem[];
};

// Fullscreen modal player
function VideoPlayerModal({
  visible,
  video,
  onClose,
}: {
  visible: boolean;
  video: VideoItem | null;
  onClose: () => void;
}) {
  const [isPaused, setIsPaused] = useState(false);
  const player = useVideoPlayer(video?.s3_url ?? "", (p) => {
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
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const generateThumbnail = async (videoUrl: string) => {
    try {
      const { uri } = await VideoThumbnails.getThumbnailAsync(videoUrl, {
        time: 1000,
      });
      return uri;
    } catch (e) {
      console.warn("Thumbnail generation error", e);
      return null;
    }
  };

  const fetchProfile = useCallback(async () => {
    if (!authUser) return;
    setLoading(true);
    try {
      const res = await axios.get<ProfileResponse>(
        `https://reels-backend-4qdr.onrender.com/api/users/${authUser.id}/profile`
      );

      // 👇 Generate thumbnails for each video
      const videosWithThumbs = await Promise.all(
        res.data.videos.map(async (v) => ({
          ...v,
          thumbnail: await generateThumbnail(v.s3_url),
        }))
      );

      setProfile({ ...res.data, videos: videosWithThumbs });
    } catch (err) {
      console.error("Error fetching profile:", err);
      Alert.alert("Error", "Could not fetch your profile data.");
    } finally {
      setLoading(false);
    }
  }, [authUser]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (!authUser) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.notLoggedText}>You’re not logged in</Text>
        <TouchableOpacity
          onPress={() => router.push("/(auth)/login")}
          style={[styles.primaryButton, { marginBottom: 10 }]}
        >
          <Text style={styles.primaryButtonText}>Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push("/(auth)/register")}
          style={styles.secondaryButton}
        >
          <Text style={styles.primaryButtonText}>Register</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.centered]}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{ color: "#fff", marginTop: 12 }}>
          Loading your uploads...
        </Text>
      </SafeAreaView>
    );
  }

  if (!profile) return null;

  const { user, videos } = profile;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <Image
            source={{
              uri:
                user.profilePic ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png",
            }}
            style={styles.profilePic}
          />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.username}>@{user.username}</Text>
            <View style={styles.statsRow}>
              <Text style={styles.stats}>Posts: {videos.length}</Text>
              
            </View>
          </View>
        </View>

        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Video Grid */}
      {videos.length === 0 ? (
        <View style={styles.centered}>
          <Text style={{ color: "#ddd", fontSize: 16 }}>No uploads yet 😕</Text>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/upload")}
            style={[styles.primaryButton, { marginTop: 12 }]}
          >
            <Text style={styles.primaryButtonText}>Upload Now</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={videos}
          numColumns={3}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.thumbnailContainer}
              activeOpacity={0.8}
              onPress={() => {
                setSelectedVideo(item);
                setModalVisible(true);
              }}
            >
              <Image
                source={{
                  uri:
                    item.thumbnail ||
                    "https://cdn.pixabay.com/photo/2024/07/20/17/12/warning-8908707_1280.png",
                }}
                style={styles.thumbnail}
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}
        />
      )}

      {/* Fullscreen Modal Player */}
      <VideoPlayerModal
        visible={modalVisible}
        video={selectedVideo}
        onClose={() => {
          setModalVisible(false);
          setSelectedVideo(null);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomColor: "#222",
    borderBottomWidth: 1,
  },
  profileSection: { flexDirection: "row", alignItems: "center" },
  profilePic: { width: 60, height: 60, borderRadius: 30 },
  username: { color: "#fff", fontSize: 18, fontWeight: "700" },
  statsRow: { flexDirection: "row", marginTop: 4, gap: 10 },
  stats: { color: "#aaa", fontSize: 13 },
  logoutButton: {
    backgroundColor: "red",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  logoutText: { color: "#fff", fontWeight: "700" },
  thumbnailContainer: {
    flex: 1 / 3,
    aspectRatio: 1,
    margin: 1,
    backgroundColor: "#111",
  },
  thumbnail: { width: "100%", height: "100%" },
  primaryButton: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  secondaryButton: {
    backgroundColor: "#6c757d",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  primaryButtonText: { color: "#fff", fontWeight: "700" },
  notLoggedText: { fontSize: 18, color: "#fff", marginBottom: 16 },

  fullscreenContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  fullscreenVideo: { width: width, height: height },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
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
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 8,
    borderRadius: 20,
  },
  closeText: { color: "#fff", fontSize: 18 },
  videoCaption: {
    position: "absolute",
    bottom: 60,
    left: 20,
    right: 20,
  },
  captionTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
  captionDesc: { color: "#ccc", marginTop: 4, fontSize: 14 },
});
