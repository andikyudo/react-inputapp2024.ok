import { Stack } from "expo-router";
import Header from "../components/Header"; // Pastikan path ini benar

export default function RootLayout() {
	return (
		<Stack
			screenOptions={{
				header: () => <Header />,
				headerStyle: {
					backgroundColor: "#f4511e",
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
				name='details'
				options={{
					headerShown: true,
				}}
			/>
		</Stack>
	);
}
