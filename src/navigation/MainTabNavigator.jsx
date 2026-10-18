import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

// Screens
import HomeScreen from "../screens/HomeScreen";
import ProfileScreen from "../screens/ProfileScreen";
import SettingScreen from "../screens/SettingScreen";

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "ChatsTab") {
            iconName = focused ? "chatbubbles" : "chatbubbles-outline";
          } else if (route.name === "ProfileTab") {
            iconName = focused ? "person" : "person-outline";
          } else if (route.name === "SettingTab") {
            iconName = focused ? "settings" : "settings-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "#8E8E93",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#E5E7EB",
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        headerStyle: { backgroundColor: "#007AFF" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold" },
      })}
    >
      <Tab.Screen
        name="ChatsTab"
        component={HomeScreen}
        options={{
          title: "Chats",
          tabBarLabel: "Messages",
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          title: "Profile",
          tabBarLabel: "Profile",
        }}
      />
      <Tab.Screen
        name="SettingTab"
        component={SettingScreen}
        options={{
          title: "Settings",
          tabBarLabel: "Settings",
        }}
      />
    </Tab.Navigator>
  );
}
