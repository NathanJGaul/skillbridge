// import { join } from "https://deno.land/std/path/mod.ts";
import config from "../config.ts";

// Read the data file
const dataPath = config.jsonFilePath;
const data = JSON.parse(await Deno.readTextFile(dataPath));

// Function to check if an object is effectively empty
function isEmptyObject(obj: Record<string, any>): boolean {
  // If the object has no keys, it's empty
  if (Object.keys(obj).length === 0) {
    return true;
  }

  // Check if all values are empty strings or empty objects
  return Object.values(obj).every((value) => {
    if (typeof value === "string") {
      return value === "";
    }
    if (typeof value === "object" && value !== null) {
      return isEmptyObject(value);
    }
    return false;
  });
}

// Filter out empty objects
const cleanedData = data.filter((item: Record<string, any>) =>
  !isEmptyObject(item)
);

console.log(
  `Removed ${data.length - cleanedData.length} empty objects from data.json`,
);

// Write the cleaned data back to data.json
await Deno.writeTextFile(dataPath, JSON.stringify(cleanedData, null, 2));
console.log("Cleanup complete!");
