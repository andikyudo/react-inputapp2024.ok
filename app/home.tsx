import "../types";
import React, { useState, useEffect } from "react";
import { View, Text, Alert } from "react-native";
import { supabase } from "../lib/supabase";
import LocationTracker from "../components/LocationTracker";

const HomeScreen: React.FC = () => {
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
		<View className='flex-1 justify-center items-center bg-gray-100'>
			<Text className='text-2xl font-bold mb-2'>Selamat Datang!</Text>
			<Text className='text-lg mb-5'>Anda telah berhasil masuk.</Text>
			{userId && <LocationTracker userId={userId} />}
		</View>
	);
};

export default HomeScreen;
