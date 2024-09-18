import React from "react";
import { GluestackUIProvider } from "@gluestack-ui/themed";
import { config } from "./gluestack-ui.config";
import Login from "./app/login"; // Sesuaikan path jika berbeda

export default function App() {
	return (
		<GluestackUIProvider config={config}>
			<Login />
		</GluestackUIProvider>
	);
}
