import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://jmzmjgrsuzekcebihnot.supabase.co";
const supabaseAnonKey =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imptem1qZ3JzdXpla2NlYmlobm90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY1ODI1MjAsImV4cCI6MjA0MjE1ODUyMH0.U-oa3BfBoThmizDgb6rc9eB0R7goJ3GeLx7MUk66Hvo";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
