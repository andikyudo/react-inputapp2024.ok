import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	SafeAreaView,
	Platform,
	Alert,
} from "react-native";
import { router } from "expo-router";
import { supabase } from "../lib/supabase";
import { stopBackgroundLocationTracking } from "../utils/locationTracking";
import { upsertUserSession } from "../utils/sessionUtils";

const Header = () => {
	const [userName, setUserName] = useState<string>("");
	const [userId, setUserId] = useState<string | null>(null);

	useEffect(() => {
		void fetchUserId();
	}, []);

	const fetchUserId = async () => {
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
			}
		} catch (error) {
			console.error("Error fetching user ID:", error);
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

	return (
		<SafeAreaView style={styles.safeArea}>
			<View style={styles.header}>
				<Text style={styles.welcomeText}>Selamat datang, {userName}</Text>
				<TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
					<Text style={styles.logoutButtonText}>Logout</Text>
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	safeArea: {
		paddingTop: Platform.OS === "android" ? 25 : 0,
		backgroundColor: "#6439FF",
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: 10,
		height: 60,
	},
	welcomeText: {
		color: "white",
		fontSize: 16,
		fontWeight: "bold",
	},
	logoutButton: {
		backgroundColor: "white",
		paddingVertical: 8,
		paddingHorizontal: 12,
		borderRadius: 10,
	},
	logoutButtonText: {
		color: "#f4511e",
		fontWeight: "bold",
		fontSize: 14,
	},
});

export default Header;
