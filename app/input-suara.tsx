import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function InputSuaraScreen() {
	return (
		<View style={styles.container}>
			<Text style={styles.title}>Input Suara Pemilu</Text>
			<Text>Halaman ini akan berisi form untuk input suara pemilu.</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 20,
	},
});
