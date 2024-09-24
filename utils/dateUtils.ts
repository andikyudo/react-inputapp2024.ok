export function getCurrentJakartaTime(): string {
	const jakartaTime = new Date().toLocaleString("en-US", {
		timeZone: "Asia/Jakarta",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: false,
	});

	// Convert to ISO 8601 format
	const [datePart, timePart] = jakartaTime.split(", ");
	const [month, day, year] = datePart.split("/");
	return `${year}-${month}-${day}T${timePart}+07:00`;
}
