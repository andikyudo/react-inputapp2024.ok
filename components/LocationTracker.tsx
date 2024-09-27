import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import * as Location from "expo-location";
import { supabase } from "../lib/supabase";

interface LocationTrackerProps {
	userId: string;
}

const LocationTracker: React.FC<LocationTrackerProps> = ({ userId }) => {
	const isMounted = useRef(true);

	useEffect(() => {
		let subscription: Location.LocationSubscription | null = null;

		const startLocationTracking = async () => {
			let { status } = await Location.requestForegroundPermissionsAsync();
			if (status !== "granted") {
				console.error("Permission to access location was denied");
				return;
			}

			subscription = await Location.watchPositionAsync(
				{
					accuracy: Location.Accuracy.High,
					timeInterval: 5000,
					distanceInterval: 10,
				},
				(location) => {
					if (isMounted.current) {
						updateLocationInSupabase(location.coords);
					}
				}
			);
		};

		startLocationTracking();

		return () => {
			isMounted.current = false;
			if (subscription) {
				subscription.remove();
			}
		};
	}, [userId]);

	const updateLocationInSupabase = async (coords: Location.Coords) => {
		try {
			const { data, error } = await supabase.from("user_locations").upsert(
				{
					user_id: userId,
					latitude: coords.latitude,
					longitude: coords.longitude,
					timestamp: new Date().toISOString(),
				},
				{
					onConflict: "user_id",
				}
			);

			if (error) throw error;
			console.log("Location updated successfully");
		} catch (error) {
			console.error("Error updating location:", error);
		}
	};

	// return (
	// 	// <View style={styles.container}>
	// 	// 	<Text>Tracking location...</Text>
	// 	// </View>
	// );
};

const styles = StyleSheet.create({
	container: {
		padding: 10,
		backgroundColor: "#f0f0f0",
		borderRadius: 5,
		marginBottom: 10,
	},
});

export default LocationTracker;
