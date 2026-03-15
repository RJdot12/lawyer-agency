import { defineCollection, z } from 'astro:content';

const casesCollection = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    title: z.string(),
    category: z.string(),
    image: image(),
    imageAlt: z.string().optional(),
    caseNumber: z.string().optional(),
    courtLink: z.string().url().optional(),
    brief: z.string(),
    situation: z.string(),
    actions: z.string(),
    result: z.string(),
    order: z.number(),
  }),
});

export const collections = {
  cases: casesCollection,
};
