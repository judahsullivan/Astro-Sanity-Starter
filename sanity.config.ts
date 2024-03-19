const projectId =
  import.meta.env.PUBLIC_SANITY_STUDIO_PROJECT_ID!
const dataset =
  import.meta.env.PUBLIC_SANITY_STUDIO_DATASET!

// Feel free to remove this check if you don't need it
if (!projectId || !dataset) {
  throw new Error(
    `Missing environment variable(s). Check if named correctly in .env file.\n\nShould be:\nPUBLIC_SANITY_STUDIO_PROJECT_ID=${projectId}\nPUBLIC_SANITY_STUDIO_DATASET=${dataset}\n\nAvailable environment variables:\n${JSON.stringify(
      import.meta.env,
      null,
      2
    )}`
  );
}

import { visionTool } from "@sanity/vision";
// ./sanity.config.ts
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";

export default defineConfig({
  name: "sanity-studio", // Can be whatever
  title: "Welcome Astronaut", // Can be whatever
  projectId,
  dataset,
  plugins: [visionTool(), structureTool()],
  schema: {
    types: [],
  },
});
