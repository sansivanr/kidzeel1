import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import { ResizeMode, Video } from "expo-av";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Share,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import defaultimage from "../../../assets/images/black.jpg";
import { useAuth } from "../../../src/context/AuthContext";

export default function Reels() {
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const API_BASE = "https://reels-backend-4qdr.onrender.com";
  const videoRefs = useRef<{ [key: number]: Video | null }>({});

  /** 🧠 Fetch Videos */
  const fetchVideos = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/videos`);

      const updatedVideos = res.data.videos.map((v: any) => ({
        ...v,
        isLiked: v.likedBy?.includes(user?.id),
      }));

      setVideos(updatedVideos);
    } catch (err: any) {
      console.error("Error fetching videos:", err.message);
    } finally {
      setLoading(false);
    }
  };

  /** 🔁 Refresh when tab is revisited */
  useFocusEffect(
    useCallback(() => {
      fetchVideos();
      return () => {
        // Pause all videos when leaving
        Object.values(videoRefs.current).forEach((ref) => {
          if (ref) ref.pauseAsync();
        });
      };
    }, [])
  );

  /** ❤️ Like Video */
  const handleLike = async (videoId: string) => {
    if (!user) {
      alert("Please login to like videos");
      return;
    }
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const res = await axios.post(
        `${API_BASE}/api/videolike/${videoId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { message } = res.data;

      setVideos((prev) =>
        prev.map((v) => {
          if (v.id !== videoId) return v;
          const isUnlike = message.includes("unliked");
          return {
            ...v,
            likesCount: v.likesCount + (isUnlike ? -1 : 1),
            isLiked: !isUnlike,
          };
        })
      );
    } catch (err: any) {
      console.error("❌ Like error:", err.message);
    }
  };

  /** 🎬 Control which video plays based on view */
  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const index = viewableItems[0].index;
      setPlayingIndex(index);

      Object.entries(videoRefs.current).forEach(([i, ref]) => {
        if (ref) {
          if (Number(i) === index && !isPaused) {
            ref.playAsync();
          } else {
            ref.pauseAsync();
          }
        }
      });
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 80,
  }).current;

  /** 🖐 Tap to toggle pause/play */
  const handleVideoPress = (index: number) => {
    const ref = videoRefs.current[index];
    if (ref) {
      if (isPaused) {
        ref.playAsync();
      } else {
        ref.pauseAsync();
      }
      setIsPaused(!isPaused);
    }
  };

  /** 💾 Render Video Item */
  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const timeAgo = item.createdAt
      ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })
      : "";

    const videoUri = item.cdn_url  || item.s3_url;

    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => handleVideoPress(index)}
        style={{
          width: screenWidth,
          height: screenHeight,
          backgroundColor: "black",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Video
          ref={(ref) => {
  videoRefs.current[index] = ref;
}}
          source={{ uri: videoUri }}
          resizeMode={ResizeMode.COVER}
          shouldPlay={index === playingIndex && !isPaused}
          isLooping
          style={{
            width: screenWidth,
            height: screenHeight,
          }}
        />

        {/* Overlay Info */}
        <View
          style={{
            position: "absolute",
            bottom: 50 + insets.bottom,
            left: 15,
            right: 15,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <View style={{ flex: 1, paddingRight: 20 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 6,
              }}
            >
              <Image
                source={
                  item.uploadedBy?.profileUrl
                    ? { uri: item.uploadedBy.profileUrl }
                    : defaultimage
                }
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  marginRight: 8,
                }}
              />
              <View>
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  {item.uploadedBy?.username || "Unknown"}
                </Text>
                <Text style={{ color: "#ccc", fontSize: 12 }}>{timeAgo}</Text>
              </View>
            </View>

            {/* 📝 Title + Description */}
{item.title ? (
  <Text
    style={{
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: 4,
    }}
    numberOfLines={1}
  >
    {item.title}
  </Text>
) : null}

{item.description ? (
  <Text
    style={{
      color: "#ddd",
      fontSize: 14,
      marginBottom: 8,
    }}
    numberOfLines={2}
  >
    {item.description}
  </Text>
) : null}

          </View>

          {/* Right Side — Like + Share */}
          <View style={{ alignItems: "center", marginRight: 10 }}>
            <TouchableOpacity
              onPress={() => handleLike(item.id)}
              style={{ marginBottom: 20 }}
            >
              <Ionicons
                name={item.isLiked ? "heart" : "heart-outline"}
                size={30}
                color={item.isLiked ? "red" : "white"}
              />
              <Text
                style={{
                  color: "white",
                  fontSize: 12,
                  textAlign: "center",
                }}
              >
                {item.likesCount}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => Share.share({ message: videoUri })}>
              <Ionicons name="share-outline" size={30} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  /** 🌀 Loading State */
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "black",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  /** 📜 Main UI */
  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <StatusBar barStyle="light-content" translucent />
      <FlatList
        data={videos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        removeClippedSubviews
        windowSize={2}
      />
    </View>
  );
}
