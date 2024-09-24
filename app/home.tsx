import "../types";
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { supabase } from "../lib/supabase";
import LocationTracker from "../components/LocationTracker";
import { upsertUserSession } from "../utils/sessionUtils";
import { stopBackgroundLocationTracking } from "../utils/locationTracking";

export default function HomeScreen() {
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
		<View style={styles.container}>
			<Text style={styles.title}>Welcome!</Text>
			<Text style={styles.subtitle}>You have successfully logged in.</Text>
			{userId && <LocationTracker userId={userId} />}
			<TouchableOpacity
				style={styles.logoutButton}
				onPress={() => void handleLogout()}
			>
				<Text style={styles.logoutButtonText}>Logout</Text>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#f5f5f5",
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 10,
	},
	subtitle: {
		fontSize: 18,
		marginBottom: 20,
	},
	logoutButton: {
		backgroundColor: "#007AFF",
		padding: 15,
		borderRadius: 10,
	},
	logoutButtonText: {
		color: "white",
		fontSize: 18,
		fontWeight: "bold",
	},
});
