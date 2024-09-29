import React, { ErrorInfo, ReactNode } from "react";
import { View, Text } from "react-native";
import { log } from "../utils/logger";

interface Props {
	children: ReactNode;
}

interface State {
	hasError: boolean;
}

class ErrorBoundary extends React.Component<Props, State> {
	state: State = { hasError: false };

	static getDerivedStateFromError(_: Error): State {
		return { hasError: true };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		log("ErrorBoundary caught an error:", error, errorInfo);
	}

	render() {
		if (this.state.hasError) {
			return (
				<View
					style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
				>
					<Text>Oops! Something went wrong.</Text>
				</View>
			);
		}

		return this.props.children;
	}
}

export default ErrorBoundary;
