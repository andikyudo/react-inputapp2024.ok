import React, { useState } from "react";
import {
	View,
	Text,
	Dimensions,
	TouchableOpacity,
	Linking,
	StyleSheet,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import PulsingDot from "./PulsingDot";

const { width } = Dimensions.get("window");
const MAP_HEIGHT = width * 0.7;

const dummyTPS = [
	{ id: "1", name: "TPS 1", latitude: -0.0358997, longitude: 109.3062702 },
	{ id: "2", name: "TPS 2", latitude: -0.036, longitude: 109.307 },
	{ id: "3", name: "TPS 3", latitude: -0.0355, longitude: 109.3065 },
	{ id: "4", name: "TPS 4", latitude: -0.0362, longitude: 109.3068 },
];

interface MapSelectorProps {
	isDarkMode: boolean;
}

const MapSelector: React.FC<MapSelectorProps> = ({ isDarkMode }) => {
	const [selectedTPS, setSelectedTPS] = useState(dummyTPS[0]);

	const navigateToTPS = () => {
		const url = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${selectedTPS.latitude},${selectedTPS.longitude}`;
		Linking.openURL(url);
	};

	return (
		<View style={styles.container}>
			<View
				style={[
					styles.pickerContainer,
					{ backgroundColor: isDarkMode ? "#333" : "white" },
				]}
			>
				<Picker
					selectedValue={selectedTPS.id}
					onValueChange={(itemValue) => {
						const tps = dummyTPS.find((t) => t.id === itemValue);
						if (tps) setSelectedTPS(tps);
					}}
					style={{ color: isDarkMode ? "white" : "black" }}
				>
					{dummyTPS.map((tps) => (
						<Picker.Item key={tps.id} label={tps.name} value={tps.id} />
					))}
				</Picker>
			</View>

			<View style={styles.mapContainer}>
				<MapView
					provider={PROVIDER_DEFAULT}
					style={styles.map}
					initialRegion={{
						latitude: selectedTPS.latitude,
						longitude: selectedTPS.longitude,
						latitudeDelta: 0.01,
						longitudeDelta: 0.01,
					}}
					region={{
						latitude: selectedTPS.latitude,
						longitude: selectedTPS.longitude,
						latitudeDelta: 0.01,
						longitudeDelta: 0.01,
					}}
				>
					<Marker coordinate={selectedTPS}>
						<PulsingDot />
					</Marker>
				</MapView>
			</View>

			<View style={styles.infoContainer}>
				<Text
					style={[styles.infoText, { color: isDarkMode ? "white" : "black" }]}
				>
					Lokasi TPS Terpilih:
				</Text>
				<Text
					style={[styles.infoText, { color: isDarkMode ? "#ccc" : "#666" }]}
				>
					Latitude: {selectedTPS.latitude}
				</Text>
				<Text
					style={[styles.infoText, { color: isDarkMode ? "#ccc" : "#666" }]}
				>
					Longitude: {selectedTPS.longitude}
				</Text>
			</View>

			<TouchableOpacity style={styles.button} onPress={navigateToTPS}>
				<Text style={styles.buttonText}>Navigasi ke TPS</Text>
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		marginBottom: 16,
	},
	pickerContainer: {
		marginBottom: 16,
		borderRadius: 8,
		overflow: "hidden",
	},
	mapContainer: {
		height: MAP_HEIGHT,
		borderWidth: 4,
		borderColor: "#3498db",
		borderRadius: 8,
		overflow: "hidden",
		marginBottom: 16,
	},
	map: {
		...StyleSheet.absoluteFillObject,
	},
	infoContainer: {
		marginBottom: 16,
	},
	infoText: {
		marginBottom: 4,
	},
	button: {
		backgroundColor: "#2ecc71",
		padding: 12,
		borderRadius: 8,
	},
	buttonText: {
		color: "white",
		textAlign: "center",
		fontWeight: "bold",
	},
});

export default MapSelector;
