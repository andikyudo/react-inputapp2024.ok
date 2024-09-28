import React from "react";
import { Stack } from "expo-router";
import Header from "../components/Header";
import { ThemeProvider, useTheme } from "../contexts/ThemeContext";
import { UserProvider } from "../contexts/UserContext";

function StackLayout() {
	const { theme } = useTheme();
	const isDarkMode = theme === "dark";

	return (
		<Stack
			screenOptions={{
				header: () => <Header />,
				headerStyle: {
					backgroundColor: isDarkMode ? "#1F2937" : "#6439FF",
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
				name='rekapitulasi'
				options={{
					title: "Rekapitulasi",
					headerShown: true,
				}}
			/>
		</Stack>
	);
}

export default function RootLayout() {
	return (
		<ThemeProvider>
			<UserProvider>
				<StackLayout />
			</UserProvider>
		</ThemeProvider>
	);
}
