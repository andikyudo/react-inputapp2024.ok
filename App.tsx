import "expo-dev-client";
import "./types";
import React, { useEffect } from "react";
import { Alert } from "react-native";
import { config } from "./gluestack-ui.config";
import { ThemeProvider } from "./contexts/ThemeContext";
import { UserProvider } from "./contexts/UserContext";
import * as Location from "expo-location";
import { NativeWindStyleSheet } from "nativewind";
import { Slot } from "expo-router";

export default function App() {
	useEffect(() => {
		(async () => {
			let { status } = await Location.requestForegroundPermissionsAsync();
			if (status !== "granted") {
				Alert.alert(
					"Izin Lokasi Diperlukan",
					"Aplikasi ini memerlukan akses ke lokasi Anda untuk memberikan layanan terbaik. Mohon aktifkan izin lokasi di pengaturan perangkat Anda."
				);
			}
		})();
	}, []);

	return (
		<ThemeProvider>
			<UserProvider>
				<NativeWindStyleSheet>
					<Slot />
				</NativeWindStyleSheet>
			</UserProvider>
		</ThemeProvider>
	);
}
