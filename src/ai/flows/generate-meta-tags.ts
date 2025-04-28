'use server';
/**
 * @fileOverview A flow to generate SEO-friendly meta titles and descriptions in German for a given URL, optionally guided by an example.
 *
 * - generateMetaTags - A function that takes a URL and an optional meta example, and returns a meta title and description.
 * - GenerateMetaTagsInput - The input type for the generateMetaTags function.
 * - GenerateMetaTagsOutput - The return type for the generateMetaTags function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {scrapeTextFromUrl} from '@/services/jina-ai';

const GenerateMetaTagsInputSchema = z.object({
  url: z.string().describe('The URL to scrape and generate meta tags for.'),
  metaExample: z.string().optional().describe('An optional example meta description to guide the generation style and character usage (e.g., ✓, ➤).'),
});
export type GenerateMetaTagsInput = z.infer<typeof GenerateMetaTagsInputSchema>;

const GenerateMetaTagsOutputSchema = z.object({
  metaTitle: z
    .string()
    .describe('The generated meta title in German (max 59 characters).'),
  metaDescription: z
    .string()
    .describe('The generated meta description in German (max 159 characters).'),
});
export type GenerateMetaTagsOutput = z.infer<typeof GenerateMetaTagsOutputSchema>;

export async function generateMetaTags(input: GenerateMetaTagsInput): Promise<GenerateMetaTagsOutput> {
  return generateMetaTagsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMetaTagsPrompt',
  input: {
    schema: z.object({
      scrapedText: z.string().describe('The scraped text content from the URL.'),
      metaExample: z.string().optional().describe('An optional example meta description for style guidance.'),
    }),
  },
  output: {
    schema: z.object({
      metaTitle: z
        .string()
        .describe('The generated meta title in German (max 59 characters).'),
      metaDescription: z
        .string()
        .describe('The generated meta description in German (max 159 characters).'),
    }),
  },
  prompt: `You are an SEO expert specializing in creating meta titles and descriptions in German.

Given the following text content from a URL, generate an SEO-friendly meta title (maximum 59 characters) and a meta description (maximum 159 characters) in German.
The meta title and description should be concise, engaging, and relevant to the content of the page.
The meta title and description should be in German.

{{#if metaExample}}
Pay close attention to the following example for style, tone, and use of special characters (like ✓ and ➤):
Example: {{{metaExample}}}
Generate the new meta description following this example's style.
{{/if}}

Text content:
{{{scrapedText}}}

Output:
`,
});

const generateMetaTagsFlow = ai.defineFlow<
  typeof GenerateMetaTagsInputSchema,
  typeof GenerateMetaTagsOutputSchema
>({
  name: 'generateMetaTagsFlow',
  inputSchema: GenerateMetaTagsInputSchema,
  outputSchema: GenerateMetaTagsOutputSchema,
},
async input => {
  const scrapedText = await scrapeTextFromUrl(input.url);

  if (!scrapedText) {
    throw new Error(`Failed to scrape text from URL: ${input.url}`);
  }

  const {output} = await prompt({
    scrapedText,
    metaExample: input.metaExample, // Pass the example to the prompt
  });

  // Simple length enforcement (could be refined)
  const finalTitle = output!.metaTitle.length > 59
    ? output!.metaTitle.substring(0, 56) + '...'
    : output!.metaTitle;
  const finalDescription = output!.metaDescription.length > 159
    ? output!.metaDescription.substring(0, 156) + '...'
    : output!.metaDescription;


  return {
      metaTitle: finalTitle,
      metaDescription: finalDescription,
  };
});
