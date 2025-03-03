/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1930317162")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE UNIQUE INDEX `idx_OP8vB8E3fl` ON `contacts` (\n  `name`,\n  `email`\n)"
    ]
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1930317162")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_OP8vB8E3fl` ON `contacts` (\n  `name`,\n  `email`\n)"
    ]
  }, collection)

  return app.save(collection)
})
