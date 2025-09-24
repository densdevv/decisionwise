'use server';

/**
 * @fileOverview Provides a summary of a list of options provided by the user.
 *
 * - summarizeOptions - A function that takes a list of options and returns a summary.
 * - SummarizeOptionsInput - The input type for the summarizeOptions function.
 * - SummarizeOptionsOutput - The return type for the summarizeOptions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeOptionsInputSchema = z.object({
  options: z
    .array(z.string())
    .describe('A list of options to be summarized.'),
});
export type SummarizeOptionsInput = z.infer<typeof SummarizeOptionsInputSchema>;

const SummarizeOptionsOutputSchema = z.object({
  summary: z.string().describe('A short summary of all the options.'),
});
export type SummarizeOptionsOutput = z.infer<typeof SummarizeOptionsOutputSchema>;

export async function summarizeOptions(input: SummarizeOptionsInput): Promise<SummarizeOptionsOutput> {
  return summarizeOptionsFlow(input);
}

const summarizeOptionsPrompt = ai.definePrompt({
  name: 'summarizeOptionsPrompt',
  input: {schema: SummarizeOptionsInputSchema},
  output: {schema: SummarizeOptionsOutputSchema},
  prompt: `You are an AI expert in summarizing information.

  Given the following list of options, provide a concise summary that captures the essence of each option:

  Options:
  {{#each options}}- {{{this}}}
  {{/each}}
  `,
});

const summarizeOptionsFlow = ai.defineFlow(
  {
    name: 'summarizeOptionsFlow',
    inputSchema: SummarizeOptionsInputSchema,
    outputSchema: SummarizeOptionsOutputSchema,
  },
  async input => {
    const {output} = await summarizeOptionsPrompt(input);
    return output!;
  }
);
