import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	KeyboardAvoidingView,
	Platform,
	TouchableWithoutFeedback,
	Keyboard,
	Alert,
} from "react-native";
import { Link, router } from "expo-router";
import { supabase } from "../lib/supabase";

export default function LoginScreen() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);

	async function handleLogin() {
		setLoading(true);
		try {
			console.log("Attempting login with:", username, password); // Log input pengguna

			const { data, error } = await supabase
				.from("profiles")
				.select()
				.eq("username", username)
				.eq("password", password);

			if (error) {
				console.error("Supabase error:", error);
				throw error;
			}

			console.log("Query result:", data); // Log hasil query

			if (data && data.length > 0) {
				// Login berhasil
				console.log("Login successful:", data[0]);
				router.replace("/home");
			} else {
				// Tidak ada pengguna yang cocok
				console.log("No matching user found");
				Alert.alert("Error", "Invalid username or password");
			}
		} catch (error) {
			console.error("Error during login:", error);
			Alert.alert("Error", error.message || "An unexpected error occurred");
		} finally {
			setLoading(false);
		}
	}

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			style={styles.container}
		>
			<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
				<View style={styles.inner}>
					<Text style={styles.title}>Welcome Back</Text>
					<View style={styles.inputContainer}>
						<TextInput
							style={styles.input}
							placeholder='Username'
							value={username}
							onChangeText={setUsername}
							autoCapitalize='none'
						/>
						<TextInput
							style={styles.input}
							placeholder='Password'
							value={password}
							onChangeText={setPassword}
							secureTextEntry
						/>
					</View>
					<TouchableOpacity
						style={styles.loginButton}
						onPress={handleLogin}
						disabled={loading}
					>
						<Text style={styles.loginButtonText}>
							{loading ? "Loading..." : "Log In"}
						</Text>
					</TouchableOpacity>
				</View>
			</TouchableWithoutFeedback>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f5f5f5",
	},
	inner: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
	},
	title: {
		fontSize: 28,
		fontWeight: "bold",
		color: "#333",
		marginBottom: 40,
	},
	inputContainer: {
		width: "100%",
	},
	input: {
		backgroundColor: "white",
		paddingHorizontal: 15,
		paddingVertical: 10,
		borderRadius: 10,
		marginTop: 5,
		fontSize: 16,
		borderWidth: 1,
		borderColor: "#ddd",
	},
	loginButton: {
		backgroundColor: "#007AFF",
		padding: 15,
		borderRadius: 10,
		alignItems: "center",
		marginTop: 20,
		width: "100%",
	},
	loginButtonText: {
		color: "white",
		fontSize: 18,
		fontWeight: "bold",
	},
	forgotPassword: {
		color: "#007AFF",
		marginTop: 15,
		fontSize: 16,
	},
	signupContainer: {
		flexDirection: "row",
		marginTop: 20,
	},
	signupText: {
		fontSize: 16,
		color: "#333",
	},
	signupLink: {
		fontSize: 16,
		color: "#007AFF",
		fontWeight: "bold",
	},
});
