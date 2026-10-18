import React, { useState, useEffect, useLayoutEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  doc,
} from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import { auth, db } from "../config/firebase";
import { Avatar, AppButton } from "../components";

export default function HomeScreen({ navigation }) {
  const currentUserId = auth.currentUser?.uid;

  const [activeTab, setActiveTab] = useState("chats"); // 'chats' | 'contacts'
  const [chats, setChats] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pasang tombol Cari / Tambah Kontak di Header kanan
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate("AddContact")}
          style={styles.headerButton}
          activeOpacity={0.7}
        >
          <Ionicons name="person-add-outline" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  /**
   * 1. Listener Realtime untuk Obrolan Aktif (Active Chats) & Profil Lawan Bicara
   */
  useEffect(() => {
    if (!currentUserId) return;

    const chatsRef = collection(db, "chats");
    const qChats = query(
      chatsRef,
      where("participants", "array-contains", currentUserId),
      orderBy("lastMessageAt", "desc"),
    );

    let unsubUserListeners = [];

    const unsubscribeChats = onSnapshot(
      qChats,
      async (snapshot) => {
        // Bersihkan listener user sebelumnya
        unsubUserListeners.forEach((unsub) => unsub());
        unsubUserListeners = [];

        const rawChats = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          const otherUserId =
            data.participants?.find((id) => id !== currentUserId) || "";
          const participantInfo = data.participantDetails?.[otherUserId] || {};

          return {
            id: docSnap.id,
            receiverId: otherUserId,
            userName:
              participantInfo?.displayName ||
              participantInfo?.email ||
              "Obrolan",
            photoURL: participantInfo?.photoURL || null,
            lastMessage: data.lastMessage || "",
            lastMessageAt: data.lastMessageAt?.toDate() || null,
            unreadCount: data.unreadCounts?.[currentUserId] || 0,
          };
        });

        // Tampilkan data chat terlebih dahulu
        setChats(rawChats);
        setLoading(false);

        // Pasang realtime listener ke dokumen `users/{receiverId}` agar photoURL & profil selalu sinkron live
        rawChats.forEach((chatItem) => {
          if (!chatItem.receiverId) return;

          const userDocRef = doc(db, "users", chatItem.receiverId);
          const unsubUser = onSnapshot(userDocRef, (userSnap) => {
            if (userSnap.exists()) {
              const uData = userSnap.data();
              setChats((prevChats) =>
                prevChats.map((c) =>
                  c.id === chatItem.id
                    ? {
                        ...c,
                        userName:
                          uData.displayName || uData.email || c.userName,
                        photoURL: uData.photoURL || c.photoURL || null,
                      }
                    : c,
                ),
              );
            }
          });
          unsubUserListeners.push(unsubUser);
        });
      },
      (error) => {
        console.error("Gagal mendengarkan obrolan aktif:", error);
        setLoading(false);
      },
    );

    return () => {
      unsubscribeChats();
      unsubUserListeners.forEach((unsub) => unsub());
    };
  }, [currentUserId]);

  /**
   * 2. Listener Realtime untuk Kontak Privat yang Tersimpan & Sinkronisasi Profil
   */
  useEffect(() => {
    if (!currentUserId) return;

    const contactsRef = collection(db, "users", currentUserId, "contacts");
    const qContacts = query(contactsRef, orderBy("addedAt", "desc"));

    let unsubContactUserListeners = [];

    const unsubscribeContacts = onSnapshot(
      qContacts,
      (snapshot) => {
        unsubContactUserListeners.forEach((unsub) => unsub());
        unsubContactUserListeners = [];

        const contactList = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        setContacts(contactList);

        // Sinkronisasi data user terbaru untuk kontak
        contactList.forEach((contactItem) => {
          const targetUid = contactItem.uid || contactItem.id;
          if (!targetUid) return;

          const userDocRef = doc(db, "users", targetUid);
          const unsubContactUser = onSnapshot(userDocRef, (userSnap) => {
            if (userSnap.exists()) {
              const uData = userSnap.data();
              setContacts((prevContacts) =>
                prevContacts.map((c) =>
                  (c.uid || c.id) === targetUid
                    ? {
                        ...c,
                        displayName: uData.displayName || c.displayName,
                        photoURL: uData.photoURL || c.photoURL || null,
                      }
                    : c,
                ),
              );
            }
          });
          unsubContactUserListeners.push(unsubContactUser);
        });
      },
      (error) => {
        console.error("Gagal mendengarkan kontak tersimpan:", error);
      },
    );

    return () => {
      unsubscribeContacts();
      unsubContactUserListeners.forEach((unsub) => unsub());
    };
  }, [currentUserId]);

  const formatTime = (date) => {
    if (!date) return "";
    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isToday) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  /**
   * Render baris obrolan aktif (Active Chat Item)
   */
  const renderChatItem = ({ item }) => {
    const hasUnread = item.unreadCount > 0;

    return (
      <TouchableOpacity
        style={styles.chatCard}
        activeOpacity={0.7}
        onPress={() =>
          navigation.navigate("Chat", {
            receiverId: item.receiverId,
            userName: item.userName,
          })
        }
      >
        <Avatar
          name={item.userName}
          photoURL={item.photoURL}
          size={48}
          showOnlineBadge={hasUnread}
          badgeColor="#007AFF"
        />

        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text
              style={[styles.userName, hasUnread && styles.userNameUnread]}
              numberOfLines={1}
            >
              {item.userName}
            </Text>
            {item.lastMessageAt && (
              <Text
                style={[styles.timeText, hasUnread && styles.timeTextUnread]}
              >
                {formatTime(item.lastMessageAt)}
              </Text>
            )}
          </View>

          <View style={styles.cardFooter}>
            <Text
              style={[
                styles.lastMessageText,
                hasUnread && styles.lastMessageTextUnread,
              ]}
              numberOfLines={1}
            >
              {item.lastMessage || "Belum ada pesan"}
            </Text>
            {/* Badge angka jumlah pesan belum dibaca */}
            {hasUnread && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {item.unreadCount > 99 ? "99+" : item.unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  /**
   * Render baris kontak tersimpan (Contact Item)
   */
  const renderContactItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.chatCard}
        activeOpacity={0.7}
        onPress={() =>
          navigation.navigate("UserDetail", {
            userId: item.uid || item.id,
            userName: item.displayName || item.email,
          })
        }
      >
        <Avatar
          name={item.displayName || item.email}
          photoURL={item.photoURL}
          size={48}
          backgroundColor="#10B981"
        />

        <View style={styles.cardContent}>
          <Text style={styles.userName} numberOfLines={1}>
            {item.displayName || "Pengguna"}
          </Text>
          <Text style={styles.emailText} numberOfLines={1}>
            {item.email}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() =>
            navigation.navigate("Chat", {
              receiverId: item.uid || item.id,
              userName: item.displayName || item.email,
            })
          }
          style={{ padding: 6 }}
        >
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={22}
            color="#007AFF"
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Sub Header Segmented Switcher: Obrolan vs Kontak */}
      <View style={styles.segmentContainer}>
        <TouchableOpacity
          style={[
            styles.segmentButton,
            activeTab === "chats" && styles.segmentButtonActive,
          ]}
          onPress={() => setActiveTab("chats")}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.segmentText,
              activeTab === "chats" && styles.segmentTextActive,
            ]}
          >
            Obrolan ({chats.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.segmentButton,
            activeTab === "contacts" && styles.segmentButtonActive,
          ]}
          onPress={() => setActiveTab("contacts")}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.segmentText,
              activeTab === "contacts" && styles.segmentTextActive,
            ]}
          >
            Kontak Saya ({contacts.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Konten Tab Obrolan */}
      {activeTab === "chats" ? (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          renderItem={renderChatItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.centerEmpty}>
              <Ionicons name="chatbubbles-outline" size={60} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>Belum Ada Obrolan Aktif</Text>
              <Text style={styles.emptyText}>
                Gunakan tab "Kontak Saya" atau tekan tombol tambah di kanan atas
                untuk memulai percakapan baru.
              </Text>
              <AppButton
                title="Cari & Tambah Kontak"
                icon="person-add"
                style={styles.emptyActionButton}
                onPress={() => navigation.navigate("AddContact")}
              />
            </View>
          }
        />
      ) : (
        /* Konten Tab Kontak Saya */
        <FlatList
          data={contacts}
          keyExtractor={(item) => item.id}
          renderItem={renderContactItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.centerEmpty}>
              <Ionicons name="people-outline" size={60} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>Daftar Kontak Kosong</Text>
              <Text style={styles.emptyText}>
                Anda belum menambahkan kontak. Cari rekan Anda dengan username
                atau email mereka.
              </Text>
              <AppButton
                title="Tambah Kontak Sekarang"
                icon="person-add"
                style={styles.emptyActionButton}
                onPress={() => navigation.navigate("AddContact")}
              />
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F8",
  },
  headerButton: {
    marginRight: 12,
  },
  segmentContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    padding: 8,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  segmentButtonActive: {
    backgroundColor: "#007AFF",
  },
  segmentText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },
  segmentTextActive: {
    color: "#FFFFFF",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  centerEmpty: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 50,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1E293B",
    marginTop: 16,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 19,
    maxWidth: 280,
  },
  emptyActionButton: {
    marginTop: 18,
  },
  listContent: {
    paddingVertical: 8,
  },
  chatCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 14,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  cardContent: {
    flex: 1,
    marginLeft: 12,
    marginRight: 6,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  userName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
    flex: 1,
    marginRight: 8,
  },
  userNameUnread: {
    fontWeight: "700",
    color: "#0F172A",
  },
  timeText: {
    fontSize: 11,
    color: "#94A3B8",
  },
  timeTextUnread: {
    color: "#007AFF",
    fontWeight: "600",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lastMessageText: {
    fontSize: 13,
    color: "#64748B",
    flex: 1,
  },
  lastMessageTextUnread: {
    color: "#0F172A",
    fontWeight: "600",
  },
  emailText: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },
  badge: {
    backgroundColor: "#007AFF",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 5,
    marginLeft: 6,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "bold",
  },
});
