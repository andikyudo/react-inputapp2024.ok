import React, { createContext, useState, useContext, useEffect } from "react";
import { useColorScheme } from "react-native";

type Theme = "light" | "dark";

interface ThemeContextType {
	theme: Theme;
	toggleTheme: () => void;
}

const defaultContextValue: ThemeContextType = {
	theme: "light",
	toggleTheme: () => {},
};

export const ThemeContext =
	createContext<ThemeContextType>(defaultContextValue);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const colorScheme = useColorScheme();
	const [theme, setTheme] = useState<Theme>(colorScheme || "light");

	useEffect(() => {
		setTheme(colorScheme || "light");
	}, [colorScheme]);

	const toggleTheme = () => {
		setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
	};

	return (
		<ThemeContext.Provider value={{ theme, toggleTheme }}>
			{children}
		</ThemeContext.Provider>
	);
};

export const useTheme = () => {
	const context = useContext(ThemeContext);
	if (context === undefined) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}
	return context;
};
