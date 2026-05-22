import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { createClient } from "@supabase/supabase-js";
import { google } from "@ai-sdk/google";
import { embedMany } from "ai";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function generateEmbeddings(texts: string[]) {
  const { embeddings } = await embedMany({
    model: google.embedding("gemini-embedding-001"),
    values: texts,
    maxRetries: 5,
    providerOptions: {
      google: {
        outputDimensionality: 768,
      },
    },
  });
  return embeddings;
}

async function ingestFile(filePath: string, type: "طريقة" | "استراتيجية") {
  console.log(`Reading ${filePath}...`);
  const fileContent = fs.readFileSync(path.join(process.cwd(), filePath), "utf-8");
  
  const records = parse(fileContent, {
    columns: false,
    skip_empty_lines: true,
    from_line: 2, // Skip header
  });

  console.log(`Found ${records.length} records. Processing...`);

  const batchSize = 10;
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    
    const strategies = batch.map((row: any) => {
      let name, theory, procedures, tech_tool, success_criteria;
      
      if (type === "استراتيجية") {
        name = row[0];
        theory = row[1];
        procedures = row[2];
        tech_tool = row[3];
        success_criteria = row[4];
      } else {
        name = row[0];
        theory = row[1];
        procedures = row[2] + "\n\nدور المعلم والمتعلم:\n" + row[3];
        tech_tool = row[4];
        success_criteria = row[5];
      }

      const content = `الاسم: ${name}\nالنظرية: ${theory}\nالإجراءات: ${procedures}\nأداة تقنية: ${tech_tool}\nمعيار النجاح: ${success_criteria}`;
      
      return {
        name,
        theory,
        procedures,
        tech_tool,
        success_criteria,
        strategy_type: type,
        content,
      };
    });

    // Generate embeddings
    console.log(`Generating embeddings for batch ${i / batchSize + 1}...`);
    const contents = strategies.map(s => s.content);
    
    try {
        const embeddings = await generateEmbeddings(contents);
        
        const recordsToInsert = strategies.map((s, idx) => ({
        ...s,
        embedding: embeddings[idx],
        }));

        const { error } = await supabase.from("teaching_strategies").insert(recordsToInsert);
        
        if (error) {
        console.error("Supabase insert error:", error);
        } else {
        console.log(`Batch ${i / batchSize + 1} inserted successfully.`);
        }

        // Wait 2.5 seconds to avoid hitting Google AI Studio rate limits
        await new Promise((resolve) => setTimeout(resolve, 2500));
    } catch (err) {
        console.error("Failed to generate embeddings or insert:", err);
    }
  }
}

async function main() {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    console.error("GOOGLE_GENERATIVE_AI_API_KEY is not set.");
    process.exit(1);
  }

  await ingestFile("strategies.csv", "استراتيجية");
  await ingestFile("methods.csv", "طريقة");
  
  console.log("Ingestion completed!");
}

main().catch(console.error);
