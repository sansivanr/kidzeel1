import { Redirect } from "expo-router";
import React from "react";

export default function Index() {
  // Redirect user to the main tab (Reels)
  return <Redirect href="/reels" />;
}
