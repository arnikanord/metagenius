
'use server';
/**
 * @fileOverview A flow to generate SEO-friendly meta titles and descriptions in German for a given URL, optionally guided by examples for title and description.
 *
 * - generateMetaTags - A function that takes a URL and optional meta examples, and returns a meta title and description.
 * - GenerateMetaTagsInput - The input type for the generateMetaTags function.
 * - GenerateMetaTagsOutput - The return type for the generateMetaTags function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {scrapeTextFromUrl} from '@/services/jina-ai';

const GenerateMetaTagsInputSchema = z.object({
  url: z.string().describe('The URL to scrape and generate meta tags for.'),
  metaTitleExample: z.string().optional().describe('An optional example meta title to guide the generation style and character usage (min 49, max 59 chars).'),
  metaDescriptionExample: z.string().optional().describe('An optional example meta description to guide the generation style and character usage (e.g., ✓, ➤) (min 140, max 159 chars).'),
});
export type GenerateMetaTagsInput = z.infer<typeof GenerateMetaTagsInputSchema>;

const GenerateMetaTagsOutputSchema = z.object({
  metaTitle: z
    .string()
    .describe('The generated meta title in German (must be between 49 and 59 characters).'),
  metaDescription: z
    .string()
    .describe('The generated meta description in German (must be between 140 and 159 characters).'),
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
      metaTitleExample: z.string().optional().describe('An optional example meta title for style guidance.'),
      metaDescriptionExample: z.string().optional().describe('An optional example meta description for style guidance.'),
    }),
  },
  output: {
    schema: z.object({
      metaTitle: z
        .string()
        .describe('The generated meta title in German (strictly between 49 and 59 characters).'),
      metaDescription: z
        .string()
        .describe('The generated meta description in German (strictly between 140 and 159 characters).'),
    }),
  },
  prompt: `You are an SEO expert specializing in creating highly effective meta titles and descriptions in German.

Given the following text content from a URL, generate an SEO-friendly meta title and a meta description in German.
Both must be in German.

**Strict Length Requirements:**
*   **Meta Title:** Must be between **49 and 59 characters** long. Absolutely no shorter than 49 and no longer than 59.
*   **Meta Description:** Must be between **140 and 159 characters** long. Absolutely no shorter than 140 and no longer than 159.

The meta title and description should be concise, engaging, relevant to the content, and optimized for click-through rates.

{{#if metaTitleExample}}
Pay close attention to the following example for the meta title's style and tone:
Meta Title Example: {{{metaTitleExample}}}
Generate the new meta title following this example's style, ensuring it meets the strict length requirement (49-59 characters).
{{else}}
Generate a compelling meta title based on the text content, ensuring it meets the strict length requirement (49-59 characters).
{{/if}}

{{#if metaDescriptionExample}}
Pay close attention to the following example for the meta description's style, tone, and use of special characters (like ✓ and ➤):
Meta Description Example: {{{metaDescriptionExample}}}
Generate the new meta description following this example's style, ensuring it meets the strict length requirement (140-159 characters).
{{else}}
Generate an engaging meta description based on the text content, ensuring it meets the strict length requirement (140-159 characters).
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
    metaTitleExample: input.metaTitleExample, // Pass title example
    metaDescriptionExample: input.metaDescriptionExample, // Pass description example
  });

  // Primarily rely on the prompt for length constraints.
  // Apply a hard cut-off only if the LLM exceeds the maximum significantly.
  // Note: The LLM might still produce slightly outside the bounds, especially minimums.
  // Further refinement might involve re-prompting if lengths are not met, but this adds complexity.

  let finalTitle = output!.metaTitle;
  if (finalTitle.length > 59) {
    console.warn(`Generated title for ${input.url} exceeded 59 chars (${finalTitle.length}). Truncating.`);
    finalTitle = finalTitle.substring(0, 59); // Hard truncate if over max
     // Attempt to make it end reasonably (e.g., not mid-word, add ellipsis if possible)
     const lastSpace = finalTitle.lastIndexOf(' ');
     if (lastSpace > 40) { // Only truncate at space if it's reasonably far in
         finalTitle = finalTitle.substring(0, lastSpace) + '...';
     } else {
        finalTitle = finalTitle.substring(0, 56) + '...'; // Default ellipsis truncate
     }
  } else if (finalTitle.length < 49) {
      console.warn(`Generated title for ${input.url} is shorter than 49 chars (${finalTitle.length}). Prompt constraints may not have been fully met.`);
      // Consider padding or regenerating in a more complex setup. For now, accept the shorter title.
  }


  let finalDescription = output!.metaDescription;
   if (finalDescription.length > 159) {
    console.warn(`Generated description for ${input.url} exceeded 159 chars (${finalDescription.length}). Truncating.`);
    finalDescription = finalDescription.substring(0, 159); // Hard truncate if over max
     // Attempt to make it end reasonably
     const lastSpace = finalDescription.lastIndexOf(' ');
     if (lastSpace > 130) { // Only truncate at space if it's reasonably far in
       finalDescription = finalDescription.substring(0, lastSpace) + '...';
     } else {
       finalDescription = finalDescription.substring(0, 156) + '...'; // Default ellipsis truncate
     }
  } else if (finalDescription.length < 140) {
      console.warn(`Generated description for ${input.url} is shorter than 140 chars (${finalDescription.length}). Prompt constraints may not have been fully met.`);
       // Consider padding or regenerating. For now, accept the shorter description.
  }


  return {
      metaTitle: finalTitle,
      metaDescription: finalDescription,
  };
});
