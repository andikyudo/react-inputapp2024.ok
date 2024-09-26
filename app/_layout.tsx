import React from "react";
import { Stack } from "expo-router";
import Header from "../components/Header";

export default function RootLayout() {
	return (
		<Stack
			screenOptions={{
				header: () => <Header />,
				headerStyle: {
					backgroundColor: "#6439FF",
				},
				headerTintColor: "#fff",
				headerTitleStyle: {
					fontWeight: "bold",
				},
			}}
		>
			<Stack.Screen
				name='index'
				options={{
					headerShown: false,
				}}
			/>
			<Stack.Screen
				name='home'
				options={{
					title: "Home",
					headerShown: true,
				}}
			/>
			<Stack.Screen
				name='input-suara'
				options={{
					title: "Input Suara Pemilu",
					headerShown: true,
				}}
			/>
			<Stack.Screen
				name='cari-tps'
				options={{
					title: "Cari TPS",
					headerShown: true,
				}}
			/>
			<Stack.Screen
				name='rekapitulasi'
				options={{
					title: "Rekapitulasi",
					headerShown: true,
				}}
			/>
		</Stack>
	);
}
