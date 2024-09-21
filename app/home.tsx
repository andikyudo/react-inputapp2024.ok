import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { supabase } from "../lib/supabase";

export default function HomeScreen() {
	const handleLogout = async () => {
		try {
			// Ambil sesi aktif terakhir
			const { data: sessionData, error: sessionError } = await supabase
				.from("user_session")
				.select("id, user_id")
				.eq("is_active", true)
				.order("login_time", { ascending: false })
				.limit(1)
				.single();

			if (sessionError) {
				if (sessionError.code === "PGRST116") {
					console.log("No active session found");
					// Tidak ada sesi aktif, langsung arahkan ke halaman login
					router.replace("/");
					return;
				}
				throw sessionError;
			}

			if (sessionData && sessionData.id && sessionData.user_id) {
				// Update sesi dengan waktu logout
				const { error: updateError } = await supabase
					.from("user_session")
					.update({
						logout_time: new Date().toISOString(),
						is_active: false,
					})
					.eq("id", sessionData.id);

				if (updateError) throw updateError;

				// Hapus lokasi user
				const { error: deleteLocationError } = await supabase
					.from("user_locations")
					.delete()
					.eq("user_id", sessionData.user_id);

				if (deleteLocationError) throw deleteLocationError;

				console.log("Logout successful, session updated and location deleted");
			} else {
				console.log("Invalid session data:", sessionData);
				// Handle kasus di mana data sesi tidak valid
			}

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
			<TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
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
