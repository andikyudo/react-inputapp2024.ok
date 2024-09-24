import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { supabase } from "../lib/supabase";
import { getCurrentJakartaTime } from "./dateUtils";

const BACKGROUND_LOCATION_TASK = "background-location-task";

export const startBackgroundLocationTracking = async (userId: string) => {
	const { status } = await Location.requestBackgroundPermissionsAsync();
	if (status !== "granted") {
		console.log("Background location permission not granted");
		return;
	}

	await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
		accuracy: Location.Accuracy.Balanced,
		timeInterval: 300000, // Update every 5 minutes
		distanceInterval: 100, // or every 100 meters
		foregroundService: {
			notificationTitle: "Location Tracking",
			notificationBody: "Tracking your location in the background",
		},
	});

	console.log("Background location tracking started");
};

TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
	if (error) {
		console.error("Background location task error:", error);
		return;
	}
	if (data) {
		const { locations } = data as { locations: Location.LocationObject[] };
		const location = locations[0];

		if (location) {
			const { database: currentTimeDatabase } = getCurrentJakartaTime();

			try {
				const { error: locationError } = await supabase
					.from("user_locations")
					.upsert(
						{
							user_id: global.userId, // We'll set this globally when user logs in
							latitude: location.coords.latitude,
							longitude: location.coords.longitude,
							timestamp: currentTimeDatabase,
						},
						{
							onConflict: "user_id",
						}
					);

				if (locationError) {
					console.error(
						"Error updating location in background:",
						locationError
					);
				} else {
					console.log("Background location updated successfully");
				}
			} catch (error) {
				console.error("Error in background location task:", error);
			}
		}
	}
});

export const stopBackgroundLocationTracking = async () => {
	await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
	console.log("Background location tracking stopped");
};
