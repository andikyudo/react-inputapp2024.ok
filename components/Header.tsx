import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	SafeAreaView,
	Platform,
	Alert,
	Animated,
	StatusBar,
	Dimensions,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import { stopBackgroundLocationTracking } from "../utils/locationTracking";
import { upsertUserSession } from "../utils/sessionUtils";

const STATUSBAR_HEIGHT = StatusBar.currentHeight;
const APPBAR_HEIGHT = Platform.OS === "ios" ? 44 : 56;

const Header = () => {
	const [userName, setUserName] = useState<string>("");
	const [userId, setUserId] = useState<string | null>(null);
	const [menuVisible, setMenuVisible] = useState(false);
	const slideAnimation = new Animated.Value(-300);

	useEffect(() => {
		void fetchUserInfo();
	}, []);

	const fetchUserInfo = async () => {
		try {
			const { data: sessionData, error: sessionError } = await supabase
				.from("user_session")
				.select("user_id")
				.eq("is_active", true)
				.order("login_time", { ascending: false })
				.limit(1)
				.single();

			if (sessionError) throw sessionError;
			if (sessionData && sessionData.user_id) {
				setUserId(sessionData.user_id);
				const { data: userData, error: userError } = await supabase
					.from("custom_users")
					.select("nama")
					.eq("id", sessionData.user_id)
					.single();

				if (userError) throw userError;
				if (userData && userData.nama) {
					setUserName(userData.nama);
				}
			}
		} catch (error) {
			console.error("Error fetching user info:", error);
			Alert.alert("Error", "Tidak dapat mengambil informasi pengguna");
		}
	};

	const handleLogout = async () => {
		try {
			if (!userId) {
				throw new Error("User ID not found");
			}

			// Stop background location tracking
			await stopBackgroundLocationTracking();

			// Clear global userId
			global.userId = undefined;

			const { data: userData, error: userError } = await supabase
				.from("custom_users")
				.select("nrp")
				.eq("id", userId)
				.single();

			if (userError) throw userError;

			await upsertUserSession(userId, userData.nrp.toString(), false);

			const { error: deleteLocationError } = await supabase
				.from("user_locations")
				.delete()
				.eq("user_id", userId);

			if (deleteLocationError) {
				console.error("Error deleting location:", deleteLocationError);
			}

			console.log(
				"Logout successful, session updated, location deleted, and tracking stopped"
			);
			router.replace("/");
		} catch (error) {
			console.error("Error during logout:", error);
			Alert.alert("Error", "Terjadi kesalahan saat logout");
		}
	};
	const toggleMenu = () => {
		setMenuVisible(!menuVisible);
		Animated.timing(slideAnimation, {
			toValue: menuVisible ? -300 : 0,
			duration: 300,
			useNativeDriver: true,
		}).start();
	};

	const navigateTo = (screen: string) => {
		toggleMenu();
		router.push(screen);
	};

	return (
		<SafeAreaView style={styles.safeArea}>
			<StatusBar barStyle='light-content' backgroundColor='#5930E5' />
			<View style={styles.header}>
				<TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
					<Ionicons name='menu' size={24} color='white' />
				</TouchableOpacity>
				<Text style={styles.welcomeText} numberOfLines={1} ellipsizeMode='tail'>
					Selamat datang, {userName}
				</Text>
				<TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
					<Text style={styles.logoutButtonText}>Logout</Text>
				</TouchableOpacity>
			</View>
			<Animated.View
				style={[styles.menu, { transform: [{ translateX: slideAnimation }] }]}
			>
				<TouchableOpacity
					style={styles.menuItem}
					onPress={() => navigateTo("/input-suara")}
				>
					<Text style={styles.menuItemText}>Input Suara Pemilu</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={styles.menuItem}
					onPress={() => navigateTo("/cari-tps")}
				>
					<Text style={styles.menuItemText}>Cari TPS</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={styles.menuItem}
					onPress={() => navigateTo("/rekapitulasi")}
				>
					<Text style={styles.menuItemText}>Lihat Rekapitulasi Anda</Text>
				</TouchableOpacity>
			</Animated.View>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	safeArea: {
		paddingTop: Platform.OS === "android" ? STATUSBAR_HEIGHT : 0,
		backgroundColor: "#5930E5",
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: 10,
		height: APPBAR_HEIGHT,
		backgroundColor: "#5930E5",
	},
	menuButton: {
		padding: 5,
	},
	welcomeText: {
		color: "white",
		fontSize: 16,
		fontWeight: "bold",
		flex: 1,
		textAlign: "center",
		marginHorizontal: 10,
	},
	logoutButton: {
		backgroundColor: "white",
		paddingVertical: 5,
		paddingHorizontal: 10,
		borderRadius: 5,
	},
	logoutButtonText: {
		color: "#5930E5",
		fontWeight: "bold",
	},
	menu: {
		position: "absolute",
		top: APPBAR_HEIGHT + (Platform.OS === "android" ? STATUSBAR_HEIGHT : 0),
		left: 0,
		bottom: 0,
		width: 300,
		backgroundColor: "#4a26b7",
		paddingTop: 20,
	},
	menuItem: {
		paddingVertical: 15,
		paddingHorizontal: 20,
		borderBottomWidth: 1,
		borderBottomColor: "#6b45d2",
	},
	menuItemText: {
		color: "white",
		fontSize: 16,
	},
});

export default Header;
