import { supabase } from "../lib/supabase";
import { getCurrentJakartaTime } from "./dateUtils";

export const upsertUserSession = async (
	userId: string,
	username: string,
	isLogin: boolean
) => {
	const currentTime = getCurrentJakartaTime();

	const { data, error } = await supabase.from("user_session").upsert(
		{
			user_id: userId,
			username: username,
			login_time: isLogin ? currentTime : null,
			logout_time: isLogin ? null : currentTime,
			is_active: isLogin,
		},
		{
			onConflict: "user_id",
			returning: "minimal",
		}
	);

	if (error) {
		console.error("Upsert error:", error);
		throw error;
	}
	console.log(isLogin ? "Login" : "Logout", "session updated successfully");
	return data;
};
