import "../types";
import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { supabase } from "../lib/supabase";
import LocationTracker from "../components/LocationTracker";
import MapSelector from "../components/MapSelector";
import { router } from "expo-router";
import { useTheme } from "../contexts/ThemeContext";
import { stopBackgroundLocationTracking } from "../utils/locationTracking";
import { upsertUserSession } from "../utils/sessionUtils";
import { log } from "../utils/logger";

export default function HomeScreen() {
	const [userId, setUserId] = useState<string | null>(null);
	const { theme } = useTheme();
	const isDarkMode = theme === "dark";

	useEffect(() => {
		void fetchUserId();
	}, []);

	const fetchUserId = async () => {
		try {
			log("Fetching user ID...");
			const { data: sessionData, error: sessionError } = await supabase
				.from("user_session")
				.select("user_id")
				.eq("is_active", true)
				.order("login_time", { ascending: false })
				.limit(1)
				.single();

			if (sessionError) throw sessionError;
			if (sessionData && sessionData.user_id) {
				log("User ID fetched:", sessionData.user_id);
				setUserId(sessionData.user_id);
			} else {
				log("No active session found, redirecting to login");
				router.replace("/");
			}
		} catch (error) {
			log("Error fetching user ID:", error);
			Alert.alert("Error", "Tidak dapat mengambil informasi pengguna");
			router.replace("/");
		}
	};

	const handleLogout = async () => {
		try {
			if (!userId) {
				throw new Error("User ID not found");
			}

			await stopBackgroundLocationTracking();
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
			log("Error during logout:", error);
			Alert.alert("Error", "Terjadi kesalahan saat logout");
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
}
