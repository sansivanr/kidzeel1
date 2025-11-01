/* 🌈 Animated Tabs Layout with Balanced + Button */
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Tabs } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";

const AnimatedIcon = ({ name, color, size, focused }: any) => {
  const scale = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: focused ? 1.3 : 1,
      friction: 5,
      tension: 120,
      useNativeDriver: true,
    }).start();

    Animated.timing(glow, {
      toValue: focused ? 1 : 0,
      duration: 400,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [focused]);

  return (
    <Animated.View
      style={{
        transform: [{ scale }],
        opacity: glow.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1],
        }),
      }}
    >
      <Ionicons name={name} size={size + 4} color={color} />
    </Animated.View>
  );
};

export default function TabsLayout() {
  const floatAnim = useRef(new Animated.Value(0)).current;

  // 🎈 Gentle floating animation for subtle liveliness
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -2,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 2,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={{
        transform: [{ translateY: floatAnim }],
        flex: 1,
      }}
    >
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: true,
          tabBarStyle: {
            position: "absolute",
            bottom: 0, // 👇 Touches bottom
            left: 0,
            right: 0,
            borderTopLeftRadius: 25,
            borderTopRightRadius: 25,
            height: 70,
            backgroundColor: "transparent",
            elevation: 0,
          },
          tabBarBackground: () => (
            <LinearGradient
              colors={["#FFE8F0", "#FFF6E9", "#E0F7FA"]}
              style={{
                flex: 1,
                borderTopLeftRadius: 25,
                borderTopRightRadius: 25,
                borderTopWidth: 1.2,
                borderColor: "#FFD1DC",
                shadowColor: "#FFB6C1",
                shadowOpacity: 0.15,
                shadowRadius: 6,
              }}
            />
          ),
          tabBarActiveTintColor: "#FF6FB5",
          tabBarInactiveTintColor: "#B0BEC5",
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "700",
            marginBottom: 6,
          },
        }}
      >
        {/* 🎞️ Reels Tab */}
        <Tabs.Screen
          name="reels/index"
          options={{
            title: "Reels",
            tabBarIcon: ({ color, size, focused }) => (
              <AnimatedIcon
                name="film-outline"
                size={size}
                color={color}
                focused={focused}
              />
            ),
          }}
        />

        {/* ➕ Upload Tab (Now perfectly aligned) */}
        <Tabs.Screen
          name="upload/index"
          options={{
            title: "",
            tabBarIcon: ({ size, focused, color }) => (
              <Animated.View
                style={{
                  transform: [{ scale: focused ? 1.2 : 1 }],
                  justifyContent: "center",
                  alignItems: "center",
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  backgroundColor: focused ? "#FF80AB" : "#FF6FB5",
                  shadowColor: "#FF80AB",
                  shadowOpacity: 0.3,
                  shadowRadius: 6,
                  elevation: 6,
                }}
              >
                <Ionicons name="add" size={28} color="#FFF" />
              </Animated.View>
            ),
          }}
        />

        {/* 🧸 Profile Tab */}
        <Tabs.Screen
          name="profile/index"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, size, focused }) => (
              <AnimatedIcon
                name="person-circle-outline"
                size={size}
                color={color}
                focused={focused}
              />
            ),
          }}
        />
      </Tabs>
    </Animated.View>
  );
}
