import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// Define user type
type User = {
  id: string;
  username: string;
  profileUrl?: string;
};

// Define context type
type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
};

// Create context (⚠️ Start as undefined to ensure proper use)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const API_BASE = "https://reels-backend-4qdr.onrender.com";

  // Load user from storage on app start
  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const userData = await AsyncStorage.getItem("user");
        if (token && userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ✅ Login
  const login = async (username: string, password: string) => {
    try {
      console.log("🔹 Attempting login with:", username);
      const res = await axios.post(`${API_BASE}/api/signin`, { username, password });

      console.log("✅ Server response:", res.data);

      if (!res.data?.token) {
        alert("No token received from server.");
        return false;
      }

      await AsyncStorage.setItem("token", res.data.token);
      await AsyncStorage.setItem("user", JSON.stringify(res.data.user));

      setUser(res.data.user);
      console.log("🎯 User saved to context:", res.data.user);
      return true;
    } catch (err: any) {
      console.error("❌ Login error:", err.response?.data || err.message);
      alert(err.response?.data?.error || "Failed to log in. Please try again.");
      return false;
    }
  };

  // ✅ Register
  const register = async (username: string, password: string) => {
    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);

      const res = await axios.post(`${API_BASE}/api/register`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const { token, user } = res.data;
      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("user", JSON.stringify(user));
      setUser(user);
      return true;
    } catch (err: any) {
      console.error("❌ Register error:", err.response?.data || err.message);
      alert(err.response?.data?.error || "Failed to register. Please try again.");
      return false;
    }
  };

  // ✅ Logout
  const logout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Safer hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an <AuthProvider>");
  }
  return context;
};
