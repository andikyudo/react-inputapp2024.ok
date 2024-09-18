import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";

export default function HomeScreen() {
	const handleLogout = () => {
		// Implementasi logout di sini
		router.replace("/");
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
