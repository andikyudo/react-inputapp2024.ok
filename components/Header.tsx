import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	SafeAreaView,
	Platform,
	Alert,
	Animated,
	StatusBar,
	Dimensions,
} from "react-native";
import { router, useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import { stopBackgroundLocationTracking } from "../utils/locationTracking";
import { upsertUserSession } from "../utils/sessionUtils";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STATUSBAR_HEIGHT = StatusBar.currentHeight || 0;
const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const Header = () => {
	const [userName, setUserName] = useState<string>("");
	const [userId, setUserId] = useState<string | null>(null);
	const [menuVisible, setMenuVisible] = useState(false);
	const [isDarkMode, setIsDarkMode] = useState(false);
	const slideAnimation = useState(new Animated.Value(-400))[0];
	const navigation = useNavigation();

	useEffect(() => {
		void fetchUserInfo();
		void loadMenuState();

		const unsubscribe = navigation.addListener("state", () => {
			void saveMenuState(false);
			setMenuVisible(false);
			slideAnimation.setValue(-400);
		});

		return unsubscribe;
	}, [navigation]);

	const fetchUserInfo = async () => {
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
				const { data: userData, error: userError } = await supabase
					.from("custom_users")
					.select("nama")
					.eq("id", sessionData.user_id)
					.single();

				if (userError) throw userError;
				if (userData && userData.nama) {
					setUserName(userData.nama);
				}
			}
		} catch (error) {
			console.error("Error fetching user info:", error);
			Alert.alert("Error", "Tidak dapat mengambil informasi pengguna");
		}
	};

	const handleLogout = async () => {
		try {
			if (!userId) {
				throw new Error("User ID not found");
			}

			// Stop background location tracking
			await stopBackgroundLocationTracking();

			// Clear global userId
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
			console.error("Error during logout:", error);
			Alert.alert("Error", "Terjadi kesalahan saat logout");
		}
	};
	const loadMenuState = async () => {
		try {
			const value = await AsyncStorage.getItem("@menu_visible");
			if (value !== null) {
				const isVisible = JSON.parse(value);
				setMenuVisible(isVisible);
				slideAnimation.setValue(isVisible ? 0 : -400);
			}
		} catch (error) {
			console.error("Error loading menu state:", error);
		}
	};

	const saveMenuState = async (isVisible: boolean) => {
		try {
			await AsyncStorage.setItem("@menu_visible", JSON.stringify(isVisible));
		} catch (error) {
			console.error("Error saving menu state:", error);
		}
	};

	const toggleMenu = () => {
		const newMenuState = !menuVisible;
		setMenuVisible(newMenuState);
		void saveMenuState(newMenuState);
		Animated.timing(slideAnimation, {
			toValue: newMenuState ? 0 : -400,
			duration: 300,
			useNativeDriver: true,
		}).start();
	};

	const closeMenu = (callback?: () => void) => {
		setMenuVisible(false);
		void saveMenuState(false);
		Animated.timing(slideAnimation, {
			toValue: -400,
			duration: 300,
			useNativeDriver: true,
		}).start(() => {
			if (callback) callback();
		});
	};

	const navigateTo = (screen: string) => {
		closeMenu(() => {
			router.push(screen);
		});
	};

	const toggleDarkMode = () => {
		setIsDarkMode(!isDarkMode);
		// Implement your dark mode logic here
	};

	return (
		<SafeAreaView
			className={`${isDarkMode ? "bg-gray-800 pt-6" : "bg-purple-600 pt-6"}`}
		>
			<View className={`pt-${STATUSBAR_HEIGHT} px-4 pb-2`}>
				<View className='flex-row justify-between items-center h-20'>
					<TouchableOpacity onPress={toggleMenu} className='p-2'>
						<Ionicons name='menu' size={24} color='white' />
					</TouchableOpacity>
					<View className='flex-1 items-center mx-2'>
						<Text
							className='text-white text-sm font-medium text-center'
							numberOfLines={1}
							ellipsizeMode='tail'
						>
							Selamat datang,
						</Text>
						<Text
							className='text-white text-sm font-medium text-center'
							numberOfLines={1}
							ellipsizeMode='tail'
						>
							{userName}
						</Text>
					</View>
					<View className='flex-row items-center'>
						<TouchableOpacity onPress={toggleDarkMode} className='mr-3'>
							<Ionicons
								name={isDarkMode ? "sunny" : "moon"}
								size={20}
								color='white'
							/>
						</TouchableOpacity>
						<TouchableOpacity onPress={handleLogout}>
							<Ionicons name='log-out' size={20} color='white' />
						</TouchableOpacity>
					</View>
				</View>
			</View>
			<Animated.View
				className={`absolute left-0 right-0 ${
					isDarkMode ? "bg-gray-900" : "bg-purple-700"
				}`}
				style={[
					{ transform: [{ translateY: slideAnimation }] },
					{ top: STATUSBAR_HEIGHT + 80 },
				]}
			>
				<TouchableOpacity
					className='py-3 px-6 border-b border-gray-500'
					onPress={() => navigateTo("/input-suara")}
				>
					<Text className='text-white text-base'>Input Suara Pemilu</Text>
				</TouchableOpacity>
				<TouchableOpacity
					className='py-3 px-6 border-b border-gray-500'
					onPress={() => navigateTo("/cari-tps")}
				>
					<Text className='text-white text-base'>Cari TPS</Text>
				</TouchableOpacity>
				<TouchableOpacity
					className='py-3 px-6 border-b border-gray-500'
					onPress={() => navigateTo("/rekapitulasi")}
				>
					<Text className='text-white text-base'>Lihat Rekapitulasi Anda</Text>
				</TouchableOpacity>
			</Animated.View>
		</SafeAreaView>
	);
};

export default Header;
