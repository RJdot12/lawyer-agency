import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { getImage } from 'astro:assets';

export const GET: APIRoute = async () => {
  const cases = await getCollection('cases');
  const sortedCases = cases.sort((a, b) => a.data.order - b.data.order);

  const casesData = await Promise.all(
    sortedCases.map(async (caseEntry) => {
      // Generate optimized WebP image URL
      const optimizedImage = await getImage({
        src: caseEntry.data.image,
        format: 'webp',
      });

      return {
        slug: caseEntry.id.replace('.md', ''),
        title: caseEntry.data.title,
        category: caseEntry.data.category,
        image: optimizedImage.src,
        imageAlt: caseEntry.data.imageAlt || 'Зображення кейсу',
        brief: caseEntry.data.brief,
        order: caseEntry.data.order,
      };
    })
  );

  return new Response(JSON.stringify(casesData), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
