import { loadEnv } from 'vite';
const {
  PUBLIC_SANITY_STUDIO_PROJECT_ID,
  PUBLIC_SANITY_STUDIO_DATASET
} = loadEnv(import.meta.env.MODE, process.cwd(), "");
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import sanity from "@sanity/astro";
import react from "@astrojs/react";
import vercel from "@astrojs/vercel/serverless";
import tailwind from "@astrojs/tailwind";
const projectId = PUBLIC_SANITY_STUDIO_PROJECT_ID;
const dataset = PUBLIC_SANITY_STUDIO_DATASET;


// https://astro.build/config
export default defineConfig({
  site: 'https://example.com',
  output: "hybrid",
  integrations: [mdx(), sitemap(), sanity({
    projectId,
    dataset,
    studioBasePath: '/admin',
    useCdn: false,
    apiVersion: "2023-03-20" // Set to date of setup to use the latest API version
  }), 
    react(), 
    tailwind({
      applyBaseStyles: false
    })],
  adapter: vercel()
});
