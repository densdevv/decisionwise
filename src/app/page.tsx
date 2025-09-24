"use client";

import { useState, useEffect } from "react";
import { Plus, X, Loader2, BrainCircuit } from "lucide-react";
import { analyzeOptionsAndReturnBest, type AnalyzeOptionsAndReturnBestOutput } from "@/ai/flows/analyze-options-and-return-best";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const RATE_LIMIT = 5;
const RATE_LIMIT_DURATION = 6 * 60 * 1000; // 6 minutes in milliseconds

export default function Home() {
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeOptionsAndReturnBestOutput | null>(null);
  const { toast } = useToast();
  const [requestTimestamps, setRequestTimestamps] = useState<number[]>([]);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (cooldown > 0) {
      interval = setInterval(() => {
        setCooldown((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [cooldown]);

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

    const now = Date.now();
    const recentRequests = requestTimestamps.filter(
      (timestamp) => now - timestamp < RATE_LIMIT_DURATION
    );

    if (recentRequests.length >= RATE_LIMIT) {
      const oldestRequest = recentRequests[0];
      const timeToWait = Math.ceil((RATE_LIMIT_DURATION - (now - oldestRequest)) / 1000);
      setCooldown(timeToWait);
      toast({
        title: "Rate limit exceeded",
        description: `Please wait before making another request.`,
        variant: "destructive",
      });
      return;
    }


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
      setRequestTimestamps([...recentRequests, now]);
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
  
  const isButtonDisabled = isLoading || cooldown > 0;

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };


  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-between bg-background p-4 sm:p-8">
      <div />
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
              <Button type="submit" disabled={isButtonDisabled} className="w-full transition-transform duration-200 ease-in-out hover:scale-105" variant="accent">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : cooldown > 0 ? (
                  `Wait ${formatTime(cooldown)}`
                ) : (
                  "Decide for Me"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {isLoading && (
            <div className="flex flex-col items-center justify-center gap-4 text-center">
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-primary [animation-delay:-0.3s]" />
                    <div className="h-2 w-2 animate-pulse rounded-full bg-primary [animation-delay:-0.15s]" />
                    <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                </div>
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
      <footer className="mt-8 w-full text-center text-sm text-muted-foreground">
        <strong>DecisionWise v1</strong> 25w39a | © 2025{' '}
        <a
          href="https://dens.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-primary/80"
        >
          densdev
        </a>
      </footer>
    </main>
  );
}
