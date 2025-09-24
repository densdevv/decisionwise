"use client";

import { useState } from "react";
import { Plus, X, Loader2, BrainCircuit } from "lucide-react";
import { analyzeOptionsAndReturnBest, type AnalyzeOptionsAndReturnBestOutput } from "@/ai/flows/analyze-options-and-return-best";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function Home() {
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeOptionsAndReturnBestOutput | null>(null);
  const { toast } = useToast();

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, ""]);
  };

  const removeOption = (indexToRemove: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, index) => index !== indexToRemove));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const filledOptions = options.map(o => o.trim()).filter(o => o !== "");
    if (filledOptions.length < 2) {
      toast({
        title: "Not enough options",
        description: "Please provide at least two options to choose from.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const aiResult = await analyzeOptionsAndReturnBest({ options: filledOptions });
      setResult(aiResult);
    } catch (error) {
      console.error(error);
      toast({
        title: "An error occurred",
        description: "Something went wrong. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 sm:p-8">
      <div className="w-full max-w-2xl space-y-8">
        <header className="text-center">
          <h1 className="font-headline text-4xl font-bold tracking-tight text-primary sm:text-5xl">
            DecisionWise
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Can't decide? Let AI make the objective choice for you.
          </p>
        </header>

        <Card className="w-full shadow-lg">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle className="font-headline">What are your options?</CardTitle>
              <CardDescription>Enter at least two things you're choosing between.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    type="text"
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    required
                    className="text-base"
                    aria-label={`Option ${index + 1}`}
                  />
                  {options.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeOption(index)}
                      aria-label={`Remove option ${index + 1}`}
                      className="shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="secondary" onClick={addOption} className="self-start">
                <Plus className="mr-2 h-4 w-4" />
                Add Option
              </Button>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="w-full" variant="accent">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Decide for Me"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {isLoading && (
            <div className="flex flex-col items-center justify-center gap-4 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                <p className="text-muted-foreground">AI is thinking...</p>
            </div>
        )}

        {result && (
          <Card className={cn(
            "w-full shadow-xl animate-in fade-in-50 duration-500"
          )}>
            <CardHeader className="items-center text-center">
              <div className="rounded-full bg-primary/10 p-3 ring-4 ring-primary/20">
                <BrainCircuit className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="mt-4 font-headline text-2xl">The best option is...</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-3xl font-bold text-primary">{result.bestOption}</p>
              <CardDescription className="mt-4 text-base">{result.reasoning}</CardDescription>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
