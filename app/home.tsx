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
				.select("id")
				.eq("is_active", true)
				.order("login_time", { ascending: false })
				.limit(1)
				.single();

			if (sessionError) throw sessionError;

			if (sessionData) {
				// Update sesi dengan waktu logout
				const { error: updateError } = await supabase
					.from("user_session")
					.update({
						logout_time: new Date().toLocaleString("en-US", {
							timeZone: "Asia/Jakarta",
						}),
						is_active: false,
					})
					.eq("id", sessionData.id);

				if (updateError) throw updateError;
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
