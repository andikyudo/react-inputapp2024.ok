import "../types";
import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, useColorScheme, Alert } from "react-native";
import { supabase } from "../lib/supabase";
import LocationTracker from "../components/LocationTracker";
import MapSelector from "../components/MapSelector";
import Header from "../components/Header";
import { router } from "expo-router";
import { useTheme } from "../contexts/ThemeContext";

const HomeScreen: React.FC = () => {
	const [userId, setUserId] = useState<string | null>(null);
	const { theme } = useTheme();
	const isDarkMode = theme === "dark";

	useEffect(() => {
		fetchUserId();
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
			} else {
				// If no active session is found, redirect to login
				router.replace("/");
			}
		} catch (error) {
			console.error("Error fetching user ID:", error);
			Alert.alert("Error", "Tidak dapat mengambil informasi pengguna");
			router.replace("/");
		}
	};

	return (
		<View className={`flex-1 ${isDarkMode ? "bg-gray-900" : "bg-gray-100"}`}>
			<ScrollView className='flex-1 p-4'>
				<MapSelector isDarkMode={isDarkMode} />
				<View
					className={`p-4 rounded-lg ${
						isDarkMode ? "bg-gray-800" : "bg-white"
					} shadow`}
				>
					<Text
						className={`text-lg font-bold mb-2 ${
							isDarkMode ? "text-white" : "text-black"
						}`}
					>
						Informasi Penting:
					</Text>
					<Text
						className={`mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
					>
						• Pastikan Anda berada di lokasi TPS yang dipilih.
					</Text>
				</View>
			</ScrollView>
			{userId && <LocationTracker userId={userId} />}
		</View>
	);
};

export default HomeScreen;
