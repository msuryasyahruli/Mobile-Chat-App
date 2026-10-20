import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Navigators & Screens
import MainTabNavigator from "./MainTabNavigator";
import ChatScreen from "../screens/ChatScreen";
import AddContactScreen from "../screens/AddContactScreen";
import UserDetailScreen from "../screens/UserDetailScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator({ currentUser }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#007AFF" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold" },
        headerBackTitleVisible: false,
        animation: "slide_from_right",
        statusBarStyle: "inverted",
      }}
    >
      {currentUser ? (
        <>
          {/* Main Tabs (Chats, Profile, Settings) */}
          <Stack.Screen
            name="Main"
            component={MainTabNavigator}
            options={{ headerShown: false }}
          />

          {/* Cari & Tambah Kontak Baru */}
          <Stack.Screen
            name="AddContact"
            component={AddContactScreen}
            options={{ title: "Tambah Kontak" }}
          />

          {/* Detail Profil User Lain */}
          <Stack.Screen
            name="UserDetail"
            component={UserDetailScreen}
            options={({ route }) => ({
              title: null,
              headerTransparent: true,
              headerStyle: { backgroundColor: "transparent" },
              headerTintColor: "#000",
              statusBarStyle: "dark",
            })}
          />

          {/* Chat Room */}
          <Stack.Screen
            name="Chat"
            component={ChatScreen}
            options={({ route }) => ({
              title: route.params?.userName || "Obrolan",
            })}
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{
              title: null,
              headerTransparent: true,
              headerStyle: { backgroundColor: "transparent" },
              headerTintColor: "#000",
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
