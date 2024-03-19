/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
/// <reference types="@sanity/astro/module" />






interface ImportMetaEnv {
  PUBLIC_SANITY_PROJECT_ID: string;
  PUBLIC_SANITY_DATASET: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
