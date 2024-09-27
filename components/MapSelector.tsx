import React, { useState } from "react";
import {
	View,
	Text,
	Dimensions,
	TouchableOpacity,
	Linking,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import MapView, { Marker } from "react-native-maps";
import PulsingDot from "./PulsingDot";

const { width } = Dimensions.get("window");
const MAP_HEIGHT = width * 0.7; // 70% of screen width

const dummyTPS = [
	{ id: "1", name: "TPS 1", latitude: -6.2088, longitude: 106.8456 },
	{ id: "2", name: "TPS 2", latitude: -6.21, longitude: 106.847 },
	{ id: "3", name: "TPS 3", latitude: -6.2076, longitude: 106.8442 },
	{ id: "4", name: "TPS 4", latitude: -6.2112, longitude: 106.8484 },
];

interface MapSelectorProps {
	isDarkMode: boolean;
}

const MapSelector: React.FC<MapSelectorProps> = ({ isDarkMode }) => {
	const [selectedTPS, setSelectedTPS] = useState(dummyTPS[0]);

	const navigateToTPS = () => {
		const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedTPS.latitude},${selectedTPS.longitude}`;
		Linking.openURL(url);
	};

	return (
		<View className='mb-4'>
			<View
				className={`mb-4 border-2 ${
					isDarkMode ? "border-gray-600" : "border-gray-300"
				} rounded-lg overflow-hidden`}
			>
				<Text
					className={`text-lg font-bold p-2 ${
						isDarkMode ? "bg-gray-800 text-white" : "bg-blue-100 text-black"
					}`}
				>
					Pilih TPS:
				</Text>
				<Picker
					selectedValue={selectedTPS.id}
					onValueChange={(itemValue) => {
						const tps = dummyTPS.find((t) => t.id === itemValue);
						if (tps) setSelectedTPS(tps);
					}}
					style={{
						backgroundColor: isDarkMode ? "#1A202C" : "white",
						color: isDarkMode ? "white" : "black",
					}}
				>
					{dummyTPS.map((tps) => (
						<Picker.Item
							key={tps.id}
							label={tps.name}
							value={tps.id}
							color={isDarkMode ? "white" : "black"}
						/>
					))}
				</Picker>
			</View>
			<View
				className={`border-4 ${
					isDarkMode ? "border-blue-700" : "border-blue-500"
				} rounded-lg overflow-hidden mb-4`}
			>
				<MapView
					style={{ width: "100%", height: MAP_HEIGHT }}
					initialRegion={{
						latitude: -6.2088,
						longitude: 106.8456,
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
			<View className='mb-4'>
				<Text
					className={`font-semibold mb-1 ${
						isDarkMode ? "text-white" : "text-black"
					}`}
				>
					Lokasi TPS Terpilih:
				</Text>
				<Text className={isDarkMode ? "text-gray-300" : "text-gray-700"}>
					Latitude: {selectedTPS.latitude}
				</Text>
				<Text className={isDarkMode ? "text-gray-300" : "text-gray-700"}>
					Longitude: {selectedTPS.longitude}
				</Text>
			</View>
			<TouchableOpacity
				className='bg-green-500 p-3 rounded-lg'
				onPress={navigateToTPS}
			>
				<Text className='text-white text-center font-bold'>
					Navigasi ke TPS
				</Text>
			</TouchableOpacity>
		</View>
	);
};

export default MapSelector;
