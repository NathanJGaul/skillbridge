import PocketBase from "pocketbase";
import config from "../config.ts";
import { Position } from "../schema.ts";

const superuserClient = new PocketBase(config.pocketbaseUrl);

// disable autocancellation so that we can handle async requests from multiple users
superuserClient.autoCancellation(false);

// authenticate as superuser via long-lived "API key"
// (see https://pocketbase.io/docs/authentication/#api-keys)
if (Deno.env.has("POCKETBASE_SUPER_TOKEN")) {
  superuserClient.authStore.save(Deno.env.get("POCKETBASE_SUPER_TOKEN")!);
  console.log("Pocketbase superuser authenticated successfully");

  console.log("Loading data from JSON");
  const rawData = await Deno.readTextFile(config.jsonFilePath);
  const data: Position[] = JSON.parse(rawData);
 
  console.log(`Found ${data.length} records in JSON`);

  data.slice(0, 5).forEach(position => {
    console.log(position);
    
  });
  
} else {
  console.error("Set the `POCKETBASE_SUPER_TOKEN` secret in a `.env` file");
}
