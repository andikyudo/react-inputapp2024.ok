import "./types";
import React, { useEffect } from "react";
import { Alert } from "react-native";
import { GluestackUIProvider } from "@gluestack-ui/themed";
import { config } from "./gluestack-ui.config";
import Login from "./app/index"; // Assuming your login component is in index.tsx
import * as Location from "expo-location";

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
		<GluestackUIProvider config={config}>
			<Login />
		</GluestackUIProvider>
	);
}
