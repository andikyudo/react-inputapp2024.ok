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
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);

	async function handleLogin() {
		setLoading(true);
		try {
			const { data, error } = await supabase.auth.signInWithPassword({
				email: email,
				password: password,
			});

			if (error) throw error;

			if (data.user) {
				// Login berhasil
				console.log("Login successful", data.user);

				// Catat sesi pengguna
				const { error: sessionError } = await supabase
					.from("user_session")
					.insert({
						user_id: data.user.id,
						username: data.user.email,
					});

				if (sessionError) {
					console.error("Error inserting session:", sessionError);
				}

				setEmail(data.user);
				router.replace("/home");
			}
		} catch (error) {
			console.error("Error during login:", error);
			Alert.alert("Error", error.message || "An unexpected error occurred");
		} finally {
			setLoading(false);
		}
	}
	async function handleLogout() {
		try {
			const { error } = await supabase.auth.signOut();
			if (error) throw error;

			// Update user session
			if (user && user.id) {
				const { error: sessionError } = await supabase
					.from("user_session")
					.update({
						logout_time: new Date().toISOString(),
						is_active: false,
					})
					.eq("user_id", user.id)
					.eq("is_active", true);

				if (sessionError)
					console.error("Error updating session:", sessionError);
			}

			setUser(null);
			router.replace("/");
		} catch (error) {
			console.error("Error during logout:", error);
			Alert.alert(
				"Error",
				error.message || "An unexpected error occurred during logout"
			);
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
							placeholder='Email'
							value={email}
							onChangeText={setEmail}
							autoCapitalize='none'
							keyboardType='email-address'
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
