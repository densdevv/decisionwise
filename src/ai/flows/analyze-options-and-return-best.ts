'use server';
/**
 * @fileOverview Analyzes a list of options and returns the best one based on AI analysis.
 *
 * - analyzeOptionsAndReturnBest - A function that takes an array of options and returns the best one.
 * - AnalyzeOptionsAndReturnBestInput - The input type for the analyzeOptionsAndReturnBest function.
 * - AnalyzeOptionsAndReturnBestOutput - The return type for the analyzeOptionsAndReturnBest function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeOptionsAndReturnBestInputSchema = z.object({
  options: z
    .array(z.string())
    .describe('An array of options to choose from.  Must have at least two options.'),
});
export type AnalyzeOptionsAndReturnBestInput = z.infer<
  typeof AnalyzeOptionsAndReturnBestInputSchema
>;

const AnalyzeOptionsAndReturnBestOutputSchema = z.object({
  bestOption: z.string().describe('The best option chosen by the AI.'),
  reasoning: z
    .string()
    .max(240)
    .describe('The AI reasoning behind choosing the best option. Be quirky and use an emoji!'),
});
export type AnalyzeOptionsAndReturnBestOutput = z.infer<
  typeof AnalyzeOptionsAndReturnBestOutputSchema
>;

export async function analyzeOptionsAndReturnBest(
  input: AnalyzeOptionsAndReturnBestInput
): Promise<AnalyzeOptionsAndReturnBestOutput> {
  return analyzeOptionsAndReturnBestFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeOptionsAndReturnBestPrompt',
  input: {schema: AnalyzeOptionsAndReturnBestInputSchema},
  output: {schema: AnalyzeOptionsAndReturnBestOutputSchema},
  prompt: `You are a quirky and fun AI assistant who loves making decisions! 🤪 Given a list of options, you will choose the best one and explain your reasoning in a fun, slightly eccentric way. Keep your reasoning under 240 characters.

Options:
{{#each options}}- {{{this}}}
{{/each}}`,
});

const analyzeOptionsAndReturnBestFlow = ai.defineFlow(
  {
    name: 'analyzeOptionsAndReturnBestFlow',
    inputSchema: AnalyzeOptionsAndReturnBestInputSchema,
    outputSchema: AnalyzeOptionsAndReturnBestOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
