import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  increment,
} from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import { auth, db } from "../config/firebase";
import { SafeAreaView } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import {
  ConfirmationModal,
  MessageActionModal,
  MessageEditModal,
} from "../components";

export default function ChatScreen({ route, navigation }) {
  const { receiverId, userName } = route.params;
  const currentUserId = auth.currentUser?.uid;
  const headerHeight = useHeaderHeight();

  // Pasang tombol info profil lawan bicara di Header kanan
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("UserDetail", {
              userId: receiverId,
              userName,
            })
          }
          activeOpacity={0.7}
        >
          <Ionicons
            name="information-circle-outline"
            size={24}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation, receiverId, userName]);

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [myReadReceiptsEnabled, setMyReadReceiptsEnabled] = useState(true);

  // State untuk Opsi Aksi Pesan (Edit & Hapus)
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isActionModalVisible, setIsActionModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [editText, setEditText] = useState("");

  const chatId = [currentUserId, receiverId].sort().join("_");
  const unreadMessagesRef = useRef([]);

  /**
   * 1. Ambil Pengaturan Privasi (Read Receipts) User Saat Ini
   */
  useEffect(() => {
    const fetchMyPrivacy = async () => {
      if (!currentUserId) return;
      try {
        const userDoc = await getDoc(doc(db, "users", currentUserId));
        if (userDoc.exists()) {
          const prefs = userDoc.data()?.preferences;
          if (prefs && typeof prefs.readReceipts === "boolean") {
            setMyReadReceiptsEnabled(prefs.readReceipts);
          }
        }
      } catch (err) {
        console.error("Gagal membaca preferensi read receipts:", err);
      }
    };

    fetchMyPrivacy();
  }, [currentUserId]);

  /**
   * 2. Listener Realtime Pesan Obrolan & Sinkronisasi Read Receipts
   */
  useEffect(() => {
    if (!currentUserId || !receiverId) return;

    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(messagesRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = [];
      const messagesToMarkAsRead = [];

      snapshot.docs.forEach((docSnap) => {
        const data = docSnap.data();
        const msg = {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
        };

        fetchedMessages.push(msg);

        // Jika pesan dikirim oleh lawan bicara dan statusnya belum 'read'
        if (msg.senderId === receiverId && msg.status !== "read") {
          messagesToMarkAsRead.push(docSnap.ref);
        }
      });

      setMessages(fetchedMessages);
      unreadMessagesRef.current = messagesToMarkAsRead;

      // Reset hitungan unread lokal saat chat terbuka
      const chatDocRef = doc(db, "chats", chatId);
      updateDoc(chatDocRef, {
        [`unreadCounts.${currentUserId}`]: 0,
      }).catch(() => {});

      // JIKA user mengaktifkan read receipts: Tandai pesan lawan bicara menjadi 'read'
      if (myReadReceiptsEnabled && messagesToMarkAsRead.length > 0) {
        const batch = writeBatch(db);
        messagesToMarkAsRead.forEach((ref) => {
          batch.update(ref, {
            status: "read",
            readAt: serverTimestamp(),
          });
        });

        batch.commit().catch((err) => {
          console.error("Gagal mengupdate status read:", err);
        });
      }
    });

    return () => unsubscribe();
  }, [chatId, currentUserId, receiverId, myReadReceiptsEnabled]);

  /**
   * 3. Mengirim Pesan Baru
   */
  const handleSendMessage = async () => {
    const textToSend = inputText.trim();
    if (!textToSend) return;

    setInputText(""); // Optimistic clear

    const now = serverTimestamp();
    const chatDocRef = doc(db, "chats", chatId);
    const messagesRef = collection(db, "chats", chatId, "messages");

    try {
      await addDoc(messagesRef, {
        text: textToSend,
        senderId: currentUserId,
        receiverId: receiverId,
        status: "delivered",
        createdAt: now,
      });

      await setDoc(
        chatDocRef,
        {
          participants: [currentUserId, receiverId],
          lastMessage: textToSend,
          lastMessageAt: now,
          unreadCounts: {
            [receiverId]: increment(1),
          },
          participantDetails: {
            [currentUserId]: {
              displayName: auth.currentUser?.displayName || "Pengguna",
              email: auth.currentUser?.email || "",
              photoURL: auth.currentUser?.photoURL || null,
            },
            [receiverId]: {
              displayName: userName || "Pengguna",
            },
          },
        },
        { merge: true },
      );
    } catch (error) {
      console.error("Gagal mengirim pesan:", error);
    }
  };

  /**
   * 4. Logika Long Press Pesan: Membuka Menu Aksi
   */
  const handleMessageLongPress = (item) => {
    if (item.senderId === currentUserId) {
      setSelectedMessage(item);
      setIsActionModalVisible(true);
    }
  };

  /**
   * 5. Eksekusi Edit Pesan
   */
  const handleSaveEditMessage = async () => {
    if (!selectedMessage) return;
    const newText = editText.trim();

    if (!newText) {
      Alert.alert("Perhatian", "Pesan tidak boleh kosong.");
      return;
    }

    try {
      const msgDocRef = doc(
        db,
        "chats",
        chatId,
        "messages",
        selectedMessage.id,
      );
      await updateDoc(msgDocRef, {
        text: newText,
        isEdited: true,
        editedAt: serverTimestamp(),
      });

      if (messages[0]?.id === selectedMessage.id) {
        await updateDoc(doc(db, "chats", chatId), {
          lastMessage: newText,
        });
      }

      setIsEditModalVisible(false);
      setSelectedMessage(null);
    } catch (error) {
      console.error("Gagal mengedit pesan:", error);
      Alert.alert("Error", "Gagal mengedit pesan.");
    }
  };

  /**
   * 6. Eksekusi Hapus Pesan
   */
  const handleConfirmDeleteMessage = async () => {
    if (!selectedMessage) return;

    try {
      const msgDocRef = doc(
        db,
        "chats",
        chatId,
        "messages",
        selectedMessage.id,
      );
      await deleteDoc(msgDocRef);

      if (messages[0]?.id === selectedMessage.id) {
        const nextMessage = messages[1];
        await updateDoc(doc(db, "chats", chatId), {
          lastMessage: nextMessage ? nextMessage.text : "Pesan telah dihapus",
        });
      }

      setIsDeleteModalVisible(false);
      setSelectedMessage(null);
    } catch (error) {
      console.error("Gagal menghapus pesan:", error);
      Alert.alert("Error", "Gagal menghapus pesan.");
    }
  };

  /**
   * Helper Render Ikon Status Read Receipts
   */
  const renderStatusIcon = (status) => {
    if (status === "read") {
      return (
        <Ionicons
          name="checkmark-done"
          size={15}
          color="#fffb00ff"
          style={styles.statusIcon}
        />
      );
    } else if (status === "delivered") {
      return (
        <Ionicons
          name="checkmark-done"
          size={15}
          color="rgba(255, 255, 255, 0.6)"
          style={styles.statusIcon}
        />
      );
    } else {
      return (
        <Ionicons
          name="checkmark"
          size={14}
          color="rgba(255, 255, 255, 0.6)"
          style={styles.statusIcon}
        />
      );
    }
  };

  const renderMessageItem = ({ item }) => {
    const isSender = item.senderId === currentUserId;

    const timeFormatted = item.createdAt.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <View
        style={[
          styles.messageRow,
          isSender ? styles.senderRow : styles.receiverRow,
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          onLongPress={() => handleMessageLongPress(item)}
          style={[
            styles.bubble,
            isSender ? styles.senderBubble : styles.receiverBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isSender ? styles.senderText : styles.receiverText,
            ]}
          >
            {item.text}
          </Text>

          <View style={styles.bubbleFooter}>
            {item.isEdited && (
              <Text
                style={[
                  styles.editedTag,
                  isSender ? styles.senderEditedTag : styles.receiverEditedTag,
                ]}
              >
                diedit •
              </Text>
            )}
            <Text
              style={[
                styles.timestampText,
                isSender ? styles.senderTimestamp : styles.receiverTimestamp,
              ]}
            >
              {timeFormatted}
            </Text>

            {isSender && renderStatusIcon(item.status)}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={headerHeight}
      >
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessageItem}
          inverted
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.listContent}
        />

        {/* Input Bar */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Tulis pesan..."
            placeholderTextColor="#8E8E93"
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              { opacity: inputText.trim().length > 0 ? 1 : 0.6 },
            ]}
            onPress={handleSendMessage}
            disabled={!inputText.trim()}
          >
            <Ionicons name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Modal Menu Aksi Pesan */}
      <MessageActionModal
        visible={isActionModalVisible}
        onClose={() => setIsActionModalVisible(false)}
        message={selectedMessage}
        onEditPress={() => {
          setIsActionModalVisible(false);
          setEditText(selectedMessage?.text || "");
          setIsEditModalVisible(true);
        }}
        onDeletePress={() => {
          setIsActionModalVisible(false);
          setIsDeleteModalVisible(true);
        }}
      />

      {/* Modal Form Edit Pesan */}
      <MessageEditModal
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        editText={editText}
        setEditText={setEditText}
        onSave={handleSaveEditMessage}
      />

      {/* Modal Konfirmasi Hapus Pesan */}
      <ConfirmationModal
        visible={isDeleteModalVisible}
        title="Hapus Pesan"
        message="Apakah Anda yakin ingin menghapus pesan ini? Tindakan ini tidak dapat dibatalkan."
        iconName="trash-outline"
        iconColor="#EF4444"
        cancelText="Batal"
        confirmText="Hapus"
        confirmButtonColor="#EF4444"
        onCancel={() => setIsDeleteModalVisible(false)}
        onConfirm={handleConfirmDeleteMessage}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F2F4F7",
  },
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageRow: {
    marginVertical: 3,
    flexDirection: "row",
  },
  senderRow: {
    justifyContent: "flex-end",
  },
  receiverRow: {
    justifyContent: "flex-start",
  },
  bubble: {
    maxWidth: "78%",
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 6,
    borderRadius: 16,
  },
  senderBubble: {
    backgroundColor: "#007AFF",
    borderBottomRightRadius: 3,
  },
  receiverBubble: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 3,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  senderText: {
    color: "#FFFFFF",
  },
  receiverText: {
    color: "#1F2937",
  },
  bubbleFooter: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    marginTop: 2,
    gap: 3,
  },
  editedTag: {
    fontSize: 10,
    fontStyle: "italic",
    marginRight: 1,
  },
  senderEditedTag: {
    color: "rgba(255, 255, 255, 0.65)",
  },
  receiverEditedTag: {
    color: "#94A3B8",
  },
  timestampText: {
    fontSize: 10,
  },
  senderTimestamp: {
    color: "rgba(255, 255, 255, 0.75)",
  },
  receiverTimestamp: {
    color: "#94A3B8",
  },
  statusIcon: {
    marginLeft: 2,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: "#F1F5F9",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 15,
    color: "#0F172A",
    marginRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
});
