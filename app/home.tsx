import "../types";
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { supabase } from "../lib/supabase";
import LocationTracker from "../components/LocationTracker";

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

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Welcome!</Text>
			<Text style={styles.subtitle}>You have successfully logged in.</Text>
			{userId && <LocationTracker userId={userId} />}
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
});
