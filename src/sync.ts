import PocketBase from "pocketbase";
import config from "../config.ts";
import { Position } from "./schema.ts";

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

  for (const position of data) {
    try {
      // console.log(`Processing position: ${position.id || 'unknown'}`);

      let locationRecord;
      if (position.location) {
        try {
          locationRecord = await superuserClient.collection("locations").create(
            {
              ...position.location,
            },
          );
        } catch (locationError) {
          console.error(`Error creating location record: ${locationError}`);

          // Try to find existing location record
          try {
            // Create filter based on the unique index fields
            const filter = `latitude="${position.location.latitude}" && ` +
              `longitude="${position.location.longitude}" && ` +
              `city="${position.location.city}" && ` +
              `state="${position.location.state}" && ` +
              `zip="${position.location.zip}"`;

            const existingLocations = await superuserClient.collection(
              "locations",
            ).getList(1, 1, {
              filter: filter,
            });

            if (existingLocations.items.length > 0) {
              locationRecord = existingLocations.items[0];
              console.log(
                `Found existing location record: ${locationRecord.id}`,
              );
            }
          } catch (findError) {
            console.error(`Failed to find existing location: ${findError}`);
          }
        }
      }

      let contactRecord;
      if (position.contact) {
        try {
          contactRecord = await superuserClient.collection("contacts").create({
            ...position.contact,
          });
        } catch (contactError) {
          console.error(`Error creating contact record: ${contactError}`);

          // Try to find existing contact record
          try {
            // Create filter based on the unique index fields
            const filter = `name="${position.contact.name}" && ` +
              `email="${position.contact.email}"`;

            const existingContacts = await superuserClient.collection(
              "contacts",
            ).getList(1, 1, {
              filter: filter,
            });

            if (existingContacts.items.length > 0) {
              contactRecord = existingContacts.items[0];
              console.log(`Found existing contact record: ${contactRecord.id}`);
            }
          } catch (findError) {
            console.error(`Failed to find existing contact: ${findError}`);
          }
        }
      }

      try {
        const record = await superuserClient.collection("positions").create({
          ...position,
          location: locationRecord?.id,
          contact: contactRecord?.id,
        });
        console.log(`Created position record: ${record.id}`);
      } catch (positionError) {
        console.error(`Error creating position record: ${positionError}`);
      }
    } catch (error) {
      console.error(`Failed to process position: ${error}`);
      // Continue to the next record
    }
  }
} else {
  console.error("Set the `POCKETBASE_SUPER_TOKEN` secret in a `.env` file");
}
