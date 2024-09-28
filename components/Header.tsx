import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	SafeAreaView,
	Animated,
	StatusBar,
	Dimensions,
	Switch,
	Alert,
} from "react-native";
import { router, useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import { stopBackgroundLocationTracking } from "../utils/locationTracking";
import { upsertUserSession } from "../utils/sessionUtils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import PulsingDot from "./PulsingDot";
import { useTheme } from "../contexts/ThemeContext";
import { useUser } from "../contexts/UserContext";

const STATUSBAR_HEIGHT = StatusBar.currentHeight || 0;
const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const HEADER_HEIGHT = 80;
const MENU_HEIGHT = 150;

const Header: React.FC = () => {
	const { theme, toggleTheme } = useTheme();
	const isDarkMode = theme === "dark";
	const [userName, setUserName] = useState<string>("");
	const [userId, setUserId] = useState<string | null>(null);
	const [menuVisible, setMenuVisible] = useState(false);
	const slideAnimation = useMemo(() => new Animated.Value(SCREEN_HEIGHT), []);
	const navigation = useNavigation();

	const toggleDarkMode = useCallback(() => {
		toggleTheme();
	}, [toggleTheme]);

	const fetchUserInfo = useCallback(async () => {
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
	}, []);

	const handleLogout = useCallback(async () => {
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
			console.error("Error during logout:", error);
			Alert.alert("Error", "Terjadi kesalahan saat logout");
		}
	}, [userId]);

	const loadMenuState = useCallback(async () => {
		try {
			const value = await AsyncStorage.getItem("@menu_visible");
			if (value !== null) {
				const isVisible = JSON.parse(value);
				setMenuVisible(isVisible);
				slideAnimation.setValue(isVisible ? 0 : SCREEN_HEIGHT);
			}
		} catch (error) {
			console.error("Error loading menu state:", error);
		}
	}, [slideAnimation]);

	const saveMenuState = useCallback(async (isVisible: boolean) => {
		try {
			await AsyncStorage.setItem("@menu_visible", JSON.stringify(isVisible));
		} catch (error) {
			console.error("Error saving menu state:", error);
		}
	}, []);

	const toggleMenu = useCallback(() => {
		const newMenuState = !menuVisible;
		setMenuVisible(newMenuState);
		void saveMenuState(newMenuState);
		Animated.timing(slideAnimation, {
			toValue: newMenuState ? 1 : 0,
			duration: 300,
			useNativeDriver: true,
		}).start();
	}, [menuVisible, saveMenuState, slideAnimation]);

	const closeMenu = useCallback(
		(callback?: () => void) => {
			setMenuVisible(false);
			void saveMenuState(false);
			Animated.timing(slideAnimation, {
				toValue: 0,
				duration: 300,
				useNativeDriver: true,
			}).start(() => {
				if (callback) callback();
			});
		},
		[saveMenuState, slideAnimation]
	);
	// const toggleDarkMode = useCallback(() => {
	// 	setIsDarkMode((prev) => !prev);
	// 	// Implement your dark mode logic here
	// }, []);

	const navigateTo = useCallback(
		(screen: string) => {
			closeMenu(() => {
				router.push(screen as never);
			});
		},
		[closeMenu, router]
	);

	useEffect(() => {
		void fetchUserInfo();
		void loadMenuState();

		const unsubscribe = navigation.addListener("state", () => {
			void saveMenuState(false);
			setMenuVisible(false);
			slideAnimation.setValue(SCREEN_HEIGHT);
		});

		return unsubscribe;
	}, [navigation, fetchUserInfo, loadMenuState, saveMenuState, slideAnimation]);

	const headerContent = useMemo(
		() => (
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
						<PulsingDot />
						<Switch
							trackColor={{ false: "#767577", true: "#f4f3f4" }}
							thumbColor={isDarkMode ? "#767577" : "#f4f3f4"}
							ios_backgroundColor='#3e3e3e'
							onValueChange={toggleDarkMode}
							value={isDarkMode}
							className='mx-3'
						/>
						<TouchableOpacity onPress={handleLogout}>
							<Ionicons name='log-out' size={20} color='white' />
						</TouchableOpacity>
					</View>
				</View>
			</View>
		),
		[userName, isDarkMode, toggleMenu, toggleDarkMode, handleLogout]
	);

	const menuContent = useMemo(
		() => (
			<Animated.View
				className={`absolute left-0 right-0 ${
					isDarkMode ? "bg-gray-900" : "bg-teal-800"
				}`}
				style={[
					{
						transform: [
							{
								translateY: slideAnimation.interpolate({
									inputRange: [0, 1],
									outputRange: [-MENU_HEIGHT, 0],
								}),
							},
						],
						opacity: slideAnimation,
						top: STATUSBAR_HEIGHT + HEADER_HEIGHT,
						zIndex: 1000,
						height: MENU_HEIGHT,
					},
				]}
			>
				<TouchableOpacity
					className='py-3 px-6 border-b border-gray-500'
					onPress={() => navigateTo("/home")}
				>
					<Text className='text-white text-base'>Home | Cari TPS</Text>
				</TouchableOpacity>
				<TouchableOpacity
					className='py-3 px-6 border-b border-gray-500'
					onPress={() => navigateTo("/input-suara")}
				>
					<Text className='text-white text-base'>Input Suara Pemilu</Text>
				</TouchableOpacity>
				<TouchableOpacity
					className='py-3 px-6 border-b border-gray-500'
					onPress={() => navigateTo("/rekapitulasi")}
				>
					<Text className='text-white text-base'>Lihat Rekapitulasi Anda</Text>
				</TouchableOpacity>
			</Animated.View>
		),
		[isDarkMode, slideAnimation, navigateTo]
	);

	return (
		<SafeAreaView
			className={`${isDarkMode ? "bg-gray-800 pt-6" : "bg-teal-900 pt-6"}`}
		>
			{menuContent}
			{headerContent}
		</SafeAreaView>
	);
};

export default Header;
