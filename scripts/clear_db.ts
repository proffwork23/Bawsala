import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function clear() {
  console.log("Clearing 'teaching_strategies' table...");
  const { data, error, count } = await supabase
    .from("teaching_strategies")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000"); // Deletes all rows

  if (error) {
    console.error("Error clearing table:", error);
  } else {
    console.log("Table cleared successfully!");
  }
}

clear().catch(console.error);
