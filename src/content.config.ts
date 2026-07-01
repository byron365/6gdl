import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const capitulos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/capitulos' }),
  schema: z.object({
    titulo: z.string(),
    numero: z.number(),
    parteNumero: z.number(),
    parteTitulo: z.string(),
    slug: z.string(),
    orden: z.number(),
  }),
});

export const collections = { capitulos };
