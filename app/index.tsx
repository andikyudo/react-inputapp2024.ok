import "../types";
import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	Alert,
	ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { supabase } from "../lib/supabase";
import * as Location from "expo-location";
import { upsertUserSession } from "../utils/sessionUtils";
import { getCurrentJakartaTime } from "../utils/dateUtils";
import { startBackgroundLocationTracking } from "../utils/locationTracking";

export default function LoginScreen() {
	const [nrp, setNrp] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (nrp.length === 8) {
			void checkCredentials();
		}
	}, [nrp, password]);

	async function checkCredentials() {
		if (nrp.length !== 8 || password.length === 0) return;

		try {
			const { data: userData, error: userError } = await supabase
				.from("custom_users")
				.select("id, nrp, password")
				.eq("nrp", nrp)
				.single();

			if (userError) throw userError;
			if (!userData) return;

			if (userData.password === password) {
				void handleLogin(userData);
			}
		} catch (error) {
			console.error("Error checking credentials:", error);
		}
	}

	async function handleLogin(userData: { id: string; nrp: string }) {
		setLoading(true);
		try {
			const { status } = await Location.requestForegroundPermissionsAsync();
			if (status !== "granted") {
				throw new Error("Izin untuk mengakses lokasi ditolak");
			}

			const location = await Location.getCurrentPositionAsync({});
			const { database: currentTimeDatabase } = getCurrentJakartaTime();

			await upsertUserSession(userData.id, userData.nrp.toString(), true);

			const { error: locationError } = await supabase
				.from("user_locations")
				.upsert(
					{
						user_id: userData.id,
						latitude: location.coords.latitude,
						longitude: location.coords.longitude,
						timestamp: getCurrentJakartaTime(),
					},
					{
						onConflict: "user_id",
					}
				);

			if (locationError) {
				console.error("Error menyimpan lokasi:", locationError);
			} else {
				console.log("Lokasi berhasil disimpan");
			}

			// Start background location tracking
			await startBackgroundLocationTracking(userData.id);

			// Set userId globally for background tasks
			global.userId = userData.id;

			console.log(
				"Login berhasil, sesi dan lokasi disimpan, tracking lokasi dimulai"
			);
			Alert.alert("Sukses", "Login berhasil");
			router.replace("/home");
		} catch (error) {
			console.error("Error selama login:", error);
			Alert.alert(
				"Error",
				error instanceof Error ? error.message : "Terjadi kesalahan saat login"
			);
		} finally {
			setLoading(false);
		}
	}

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Login Aplikasi Voting</Text>
			<TextInput
				style={styles.input}
				placeholder='NRP'
				value={nrp}
				onChangeText={setNrp}
				keyboardType='numeric'
				maxLength={8}
			/>
			<TextInput
				style={styles.input}
				placeholder='Password'
				value={password}
				onChangeText={setPassword}
				keyboardType='numeric'
				secureTextEntry
			/>
			<TouchableOpacity
				style={styles.button}
				onPress={() => void checkCredentials()}
				disabled={loading || nrp.length !== 8 || password.length === 0}
			>
				<Text style={styles.buttonText}>
					{loading ? "Sedang Login..." : "Login"}
				</Text>
			</TouchableOpacity>
			{loading && <ActivityIndicator size='large' color='#0000ff' />}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		padding: 20,
		backgroundColor: "#f5f5f5",
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 20,
		textAlign: "center",
	},
	input: {
		height: 50,
		borderColor: "#ddd",
		borderWidth: 1,
		marginBottom: 15,
		paddingHorizontal: 15,
		borderRadius: 10,
		backgroundColor: "white",
	},
	button: {
		backgroundColor: "#007AFF",
		padding: 15,
		borderRadius: 10,
		alignItems: "center",
	},
	buttonText: {
		color: "white",
		fontSize: 18,
		fontWeight: "bold",
	},
});
