import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function check() {
  console.log("Checking Supabase connection for URL:", SUPABASE_URL);
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error("Missing Supabase credentials in .env.local!");
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  // Try querying teaching_strategies table
  const response = await supabase
    .from("teaching_strategies")
    .select("*", { count: "exact", head: true });

  console.log("Full Supabase Select Response:", response);

  if (response.error) {
    console.error("Error querying table 'teaching_strategies':", response.error.message);
    console.log("This probably means the table doesn't exist yet. You need to run the SQL in your Supabase SQL editor.");
    return;
  }
  
  console.log("Successfully connected! Table 'teaching_strategies' exists. Current row count:", response.count);

  // Test match_strategies RPC
  const mockVector = Array(768).fill(0);
  const { data: rpcData, error: rpcError } = await supabase.rpc("match_strategies", {
    query_embedding: mockVector,
    match_threshold: 0.0,
    match_count: 1
  });

  if (rpcError) {
    console.error("Error calling RPC match_strategies:", rpcError.message);
    console.log("Please make sure you have run the match_strategies SQL function in your Supabase SQL editor.");
  } else {
    console.log("Successfully called RPC match_strategies. Test response:", rpcData);
  }
}

check().catch(console.error);
