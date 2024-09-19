import React, { useState } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	Alert,
} from "react-native";
import { router } from "expo-router";
import { supabase } from "../lib/supabase";

export default function LoginScreen() {
	const [nrp, setNrp] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);

	async function handleLogin() {
		setLoading(true);
		try {
			console.log("Attempting login with NRP:", nrp);

			// Pastikan NRP adalah angka
			const nrpNumber = parseInt(nrp, 10);
			if (isNaN(nrpNumber)) {
				throw new Error("NRP harus berupa angka");
			}

			// Cari user berdasarkan NRP
			const { data: userData, error: userError } = await supabase
				.from("custom_users")
				.select("id, nrp, password")
				.eq("nrp", nrpNumber)
				.single();

			if (userError) {
				console.error("Error fetching user:", userError);
				throw new Error("Gagal mengambil data pengguna");
			}

			if (!userData) {
				console.log("No user found with NRP:", nrp);
				throw new Error("NRP tidak ditemukan");
			}

			console.log("User found:", userData);

			// Periksa password
			if (userData.password !== password) {
				console.log("Password mismatch");
				throw new Error("Password salah");
			}

			// Buat sesi pengguna
			const { data: sessionData, error: sessionError } = await supabase
				.from("user_session")
				.insert({
					user_id: userData.id,
					username: userData.nrp.toString(),
					login_time: new Date().toISOString(),
					is_active: true,
				})
				.select()
				.single();

			if (sessionError) {
				console.error("Error creating session:", sessionError);
				throw new Error("Gagal membuat sesi");
			}

			console.log("Login successful, session created:", sessionData);

			// Set user state (Anda perlu mengimplementasikan state management)
			// setUser({ id: userData.id, nrp: userData.nrp });

			Alert.alert("Sukses", "Login berhasil");
			router.replace("/home");
		} catch (error) {
			console.error("Error during login:", error);
			Alert.alert("Error", error.message || "Terjadi kesalahan saat login");
		} finally {
			setLoading(false);
		}
	}

	return (
		<View style={styles.container}>
			<TextInput
				style={styles.input}
				placeholder='NRP'
				value={nrp}
				onChangeText={setNrp}
				keyboardType='numeric'
			/>
			<TextInput
				style={styles.input}
				placeholder='Password'
				value={password}
				onChangeText={setPassword}
				secureTextEntry
			/>
			<TouchableOpacity
				style={styles.button}
				onPress={handleLogin}
				disabled={loading}
			>
				<Text style={styles.buttonText}>
					{loading ? "Logging in..." : "Login"}
				</Text>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		padding: 20,
	},
	input: {
		height: 40,
		borderColor: "gray",
		borderWidth: 1,
		marginBottom: 10,
		paddingHorizontal: 10,
	},
	button: {
		backgroundColor: "#0000ff",
		padding: 10,
		alignItems: "center",
	},
	buttonText: {
		color: "white",
	},
});
