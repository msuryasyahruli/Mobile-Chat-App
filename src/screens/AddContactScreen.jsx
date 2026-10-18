import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  collection,
  query,
  limit,
  getDocs,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import { auth, db } from "../config/firebase";
import { Avatar, AppButton } from "../components";

export default function AddContactScreen({ navigation }) {
  const currentUserId = auth.currentUser?.uid;
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [addingContactId, setAddingContactId] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Cache user data untuk pencarian real-time yang cepat dan hemat read Firestore
  const cachedUsersRef = useRef(null);

  /**
   * Mengambil daftar pengguna dari Firestore jika belum di-cache
   */
  const fetchUsers = useCallback(async () => {
    if (cachedUsersRef.current) {
      return cachedUsersRef.current;
    }
    const usersRef = collection(db, "users");
    // Ambil batas wajar pengguna untuk pencarian dinamis
    const q = query(usersRef, limit(100));
    const snapshot = await getDocs(q);

    const userList = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.uid !== currentUserId) {
        userList.push({
          id: docSnap.id,
          ...data,
        });
      }
    });

    cachedUsersRef.current = userList;
    return userList;
  }, [currentUserId]);

  /**
   * Melakukan pencarian dinamis (case-insensitive & substring partial match)
   * Cocok untuk nama parsial ("bud" -> "Budi Santoso") dan email parsial
   */
  const executeSearch = useCallback(
    async (rawTerm) => {
      const term = rawTerm.trim().toLowerCase();

      if (!term) {
        setSearchResults([]);
        setSearching(false);
        setHasSearched(false);
        return;
      }

      setSearching(true);
      setHasSearched(true);

      try {
        const users = await fetchUsers();

        const filtered = users.filter((user) => {
          const displayNameLower = (user.displayName || "").toLowerCase();
          const emailLower = (user.email || "").toLowerCase();

          // Substring match: tidak perlu ketik penuh, tidak sensitif huruf besar/kecil
          return displayNameLower.includes(term) || emailLower.includes(term);
        });

        setSearchResults(filtered);
      } catch (error) {
        console.error("Gagal mencari pengguna:", error);
        Alert.alert("Gagal Mencari", "Terjadi kesalahan saat mencari kontak.");
      } finally {
        setSearching(false);
      }
    },
    [fetchUsers],
  );

  /**
   * Debounce effect saat user mengetik:
   * Otomatis mencari setelah 300ms tanpa perlu menekan tombol 'Cari'
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      executeSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, executeSearch]);

  /**
   * Handler tombol Cari atau submit keyboard
   */
  const handleManualSearch = () => {
    executeSearch(searchQuery);
  };

  /**
   * Menambahkan pengguna ke sub-koleksi `users/{currentUserId}/contacts/{contactUserId}`
   */
  const handleAddContact = async (contactUser) => {
    if (!currentUserId) return;

    setAddingContactId(contactUser.uid);

    try {
      const contactDocRef = doc(
        db,
        "users",
        currentUserId,
        "contacts",
        contactUser.uid,
      );

      await setDoc(contactDocRef, {
        uid: contactUser.uid,
        displayName: contactUser.displayName || "Pengguna",
        email: contactUser.email,
        addedAt: serverTimestamp(),
      });

      Alert.alert(
        "Berhasil Ditambahkan",
        `${contactUser.displayName || contactUser.email} telah ditambahkan ke daftar kontak Anda.`,
        [
          {
            text: "Kirim Pesan",
            onPress: () => {
              navigation.navigate("Chat", {
                receiverId: contactUser.uid,
                userName: contactUser.displayName || contactUser.email,
              });
            },
          },
          { text: "Tutup", style: "cancel" },
        ],
      );
    } catch (error) {
      console.error("Gagal menambahkan kontak:", error);
      Alert.alert("Error", "Gagal menyimpan kontak.");
    } finally {
      setAddingContactId(null);
    }
  };

  const renderResultItem = ({ item }) => {
    const isAdding = addingContactId === item.uid;

    return (
      <TouchableOpacity
        style={styles.userCard}
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
          size={46}
        />

        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.displayName || "Pengguna"}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
        </View>

        <AppButton
          title="Tambah"
          icon="person-add"
          size="sm"
          onPress={() => handleAddContact(item)}
          disabled={isAdding}
          loading={isAdding}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Input Bar */}
      <View style={styles.searchHeader}>
        <View style={styles.searchBox}>
          <Ionicons
            name="search"
            size={20}
            color="#8E8E93"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Ketik sebagian nama atau email..."
            placeholderTextColor="#8E8E93"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleManualSearch}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery("");
                setSearchResults([]);
                setHasSearched(false);
              }}
              style={styles.clearIcon}
            >
              <Ionicons name="close-circle" size={18} color="#8E8E93" />
            </TouchableOpacity>
          )}
        </View>

        <AppButton
          title="Cari"
          size="sm"
          style={styles.searchButton}
          onPress={handleManualSearch}
        />
      </View>

      {/* Results / Empty States */}
      {searching ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Mencari pengguna...</Text>
        </View>
      ) : (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.uid || item.id}
          renderItem={renderResultItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            hasSearched && searchQuery.trim().length > 0 ? (
              <View style={styles.center}>
                <Ionicons name="search-outline" size={56} color="#CBD5E1" />
                <Text style={styles.emptyTitle}>Pengguna Tidak Ditemukan</Text>
                <Text style={styles.emptySubtitle}>
                  Tidak ada pengguna yang cocok dengan "{searchQuery}".
                </Text>
              </View>
            ) : (
              <View style={styles.center}>
                <Ionicons name="people-outline" size={56} color="#CBD5E1" />
                <Text style={styles.emptyTitle}>Cari Kontak Baru</Text>
                <Text style={styles.emptySubtitle}>
                  Masukkan email atau nama lengkap rekan Anda untuk disimpan ke
                  kontak.
                </Text>
              </View>
            )
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
  searchHeader: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    gap: 10,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  clearIcon: {
    padding: 4,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#0F172A",
  },
  searchButton: {
    height: 44,
    paddingHorizontal: 16,
  },
  listContent: {
    paddingVertical: 12,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    marginTop: 40,
  },
  loadingText: {
    marginTop: 12,
    color: "#64748B",
    fontSize: 14,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 14,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  userName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1E293B",
  },
  userEmail: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
});
