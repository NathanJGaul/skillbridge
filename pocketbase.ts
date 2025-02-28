import PocketBase from "pocketbase";
import config from "./config.ts";
import { Position } from "./schema.ts";

const pb = new PocketBase(config.pocketbaseUrl);



const rawData = await Deno.readTextFile(config.jsonFilePath);
const data: Position[] = JSON.parse(rawData);

console.log(data.length);