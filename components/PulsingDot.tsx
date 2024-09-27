import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet } from "react-native";

const PulsingDot: React.FC = () => {
	const scaleAnim = useRef(new Animated.Value(0)).current;
	const opacityAnim = useRef(new Animated.Value(1)).current;

	useEffect(() => {
		Animated.loop(
			Animated.parallel([
				Animated.timing(scaleAnim, {
					toValue: 1,
					duration: 1500,
					useNativeDriver: true,
				}),
				Animated.timing(opacityAnim, {
					toValue: 0,
					duration: 1500,
					useNativeDriver: true,
				}),
			])
		).start();
	}, []);

	return (
		<View style={styles.container}>
			<Animated.View
				style={[
					styles.dot,
					{
						transform: [{ scale: scaleAnim }],
						opacity: opacityAnim,
					},
				]}
			/>
			<View style={styles.centerDot} />
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		width: 40,
		height: 40,
		justifyContent: "center",
		alignItems: "center",
	},
	dot: {
		position: "absolute",
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: "rgba(76, 175, 80, 0.6)",
	},
	centerDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: "#4CAF50",
	},
});

export default PulsingDot;
