import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  FlatList,
  StatusBar,
  useWindowDimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Video, ResizeMode } from "expo-av";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../../src/context/AuthContext";
import defaultimage from "../../../assets/images/black.jpg";

export default function Reels() {
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const API_BASE = "https://reels-backend-4qdr.onrender.com";

  useEffect(() => {
    fetchVideos();
  }, []);

 const fetchVideos = async () => {
  try {
    const res = await axios.get(`${API_BASE}/api/videos`);

    // ✅ Add isLiked based on likedBy array
    const updatedVideos = res.data.videos.map((v: any) => ({
      ...v,
      isLiked: v.likedBy?.includes(user?.id), // check if user liked it
    }));

    setVideos(updatedVideos);
  } catch (err: any) {
    console.error("Error fetching videos:", err.message);
  } finally {
    setLoading(false);
  }
};


  const handleLike = async (videoId: string) => {
    if (!user) {
      alert("Please login to like videos");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      console.log("🔑 Token retrieved before like:", token);

      if (!token) {
        console.warn("⚠️ No token found in AsyncStorage — user might be logged out.");
        return;
      }

      const res = await axios.post(
        `${API_BASE}/api/videolike/${videoId}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("✅ Like success response:", res.data);

      const { message } = res.data;

      setVideos((prev) =>
        prev.map((v) => {
          if (v.id !== videoId) return v;
          const isUnlike = message.includes("unliked");
          return {
            ...v,
            likesCount: v.likesCount + (isUnlike ? -1 : 1),
            isLiked: !isUnlike, // ✅ update like state for UI
          };
        })
      );
    } catch (err: any) {
      console.error("❌ Like error:", err.message);
      if (err.response) {
        console.error("Backend Response:", err.response.data);
        console.error("Status Code:", err.response.status);
      }
    }
  };

  const handleShare = async (url: string) => {
    try {
      await Share.share({
        message: `Check out this video! ${url}`,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  if (loading)
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

  const renderItem = ({ item }: { item: any }) => {
    const timeAgo = item.createdAt
      ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })
      : "";

    return (
      <View
        style={{
          width: screenWidth,
          height: screenHeight,
          backgroundColor: "black",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: screenWidth,
            height: screenHeight,
            bottom: 120 + insets.bottom,
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          <Video
            source={{ uri: item.s3_url }}
            resizeMode={ResizeMode.COVER}
            shouldPlay
            isLooping
            style={{
              width: "100%",
              height: "100%",
            }}
          />
        </View>

        <View
          style={{
            position: "absolute",
            bottom: 145 + insets.bottom,
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
                  item.uploadedBy?.profilePic
                    ? { uri: item.uploadedBy.profilePic }
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

            <Text
              style={{
                color: "#fff",
                marginBottom: 8,
                fontSize: 14,
              }}
              numberOfLines={2}
            >
              {item.description || ""}
            </Text>
          </View>

          {/* ❤️ Right side — like + share */}
          <View style={{ alignItems: "center", marginRight: 10 }}>
            <TouchableOpacity
              onPress={() => handleLike(item.id)}
              style={{ marginBottom: 20 }}
            >
              <Ionicons
                name={item.isLiked ? "heart" : "heart-outline"} // ✅ toggle icon
                size={30}
                color={item.isLiked ? "red" : "white"} // ✅ toggle color
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

            <TouchableOpacity onPress={() => handleShare(item.s3_url)}>
              <Ionicons name="share-outline" size={30} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <StatusBar barStyle="light-content" translucent />
      <FlatList
        data={videos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        pagingEnabled
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
