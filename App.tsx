
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { PromptForm } from './components/PromptForm';
import { ImageDisplay } from './components/ImageDisplay';
import { rewritePrompt, generateImage } from './services/generationService';
import { quantizeImage } from './utils/imageProcessor';
import { EXAMPLE_PROMPTS } from './constants';

const USAGE_STORAGE_KEY = 'zxSpectrumGeneratorUsage';
const DAILY_LIMIT = 3;

interface UsageData {
    count: number;
    date: string; // YYYY-MM-DD
}

// Helper to get N random prompts from the main list
const getRandomPrompts = (allPrompts: string[], count: number): string[] => {
    const shuffled = [...allPrompts].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};

const getTodayDateString = () => new Date().toISOString().split('T')[0];


const App: React.FC = () => {
    const [prompt, setPrompt] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingStep, setLoadingStep] = useState<string>('');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [displayPrompts, setDisplayPrompts] = useState<string[]>([]);
    const [generationsLeft, setGenerationsLeft] = useState<number>(DAILY_LIMIT);

    const isLimitReached = generationsLeft <= 0;

    useEffect(() => {
        // Check usage on initial load
        const storedUsage = localStorage.getItem(USAGE_STORAGE_KEY);
        const today = getTodayDateString();
        
        if (storedUsage) {
            try {
                const usageData: UsageData = JSON.parse(storedUsage);
                if (usageData.date === today) {
                    setGenerationsLeft(Math.max(0, DAILY_LIMIT - usageData.count));
                } else {
                    // It's a new day, reset
                    localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify({ count: 0, date: today }));
                    setGenerationsLeft(DAILY_LIMIT);
                }
            } catch (e) {
                // Corrupted data, reset
                localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify({ count: 0, date: today }));
                setGenerationsLeft(DAILY_LIMIT);
            }
        } else {
            // No usage data found, initialize for the day
             localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify({ count: 0, date: today }));
             setGenerationsLeft(DAILY_LIMIT);
        }

        setDisplayPrompts(getRandomPrompts(EXAMPLE_PROMPTS, 5));
    }, []);


    const handleGenerate = useCallback(async () => {
        if (isLimitReached) {
            setError('You have reached your daily generation limit.');
            return;
        }

        if (!prompt) {
            setError('Please enter a description.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedImage(null);

        try {
            setLoadingStep('REWRITING PROMPT...');
            const rewrittenPrompt = await rewritePrompt(prompt);
            console.log('Rewritten Prompt:', rewrittenPrompt);

            setLoadingStep('GENERATING IMAGE...');
            const base64Image = await generateImage(rewrittenPrompt);
            const imageDataUrl = `data:image/png;base64,${base64Image}`;

            setLoadingStep('QUANTIZING COLOURS...');
            const quantizedImage = await quantizeImage(imageDataUrl);
            setGeneratedImage(quantizedImage);

            // On success, update usage
            const today = getTodayDateString();
            const storedUsage = localStorage.getItem(USAGE_STORAGE_KEY);
            let currentCount = 0;
            if (storedUsage) {
                const usageData: UsageData = JSON.parse(storedUsage);
                if (usageData.date === today) {
                    currentCount = usageData.count;
                }
            }
            const newCount = currentCount + 1;
            localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify({ count: newCount, date: today }));
            setGenerationsLeft(DAILY_LIMIT - newCount);


        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
            setLoadingStep('');
        }
    }, [prompt, isLimitReached]);

    const handleExampleClick = (example: string) => {
        setPrompt(example);
    };

    return (
        <div className="min-h-screen bg-black flex flex-col items-center p-4 sm:p-6 md:p-8">
            <div className="w-full max-w-4xl">
                <Header />
                <main className="mt-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="flex flex-col space-y-6">
                           <PromptForm
                                prompt={prompt}
                                setPrompt={setPrompt}
                                onGenerate={handleGenerate}
                                isLoading={isLoading}
                                isLimitReached={isLimitReached}
                                generationsLeft={generationsLeft}
                            />
                             <div>
                                <h2 className="text-lg mb-3 text-[#00D7D7]">TRY THESE...</h2>
                                <div className="flex flex-wrap gap-2">
                                    {displayPrompts.map((example, index) => (
                                        <button 
                                            key={index}
                                            onClick={() => handleExampleClick(example)}
                                            disabled={isLoading || isLimitReached}
                                            className="bg-[#0000D7] text-white py-1 px-2 text-xs hover:bg-[#0000FF] disabled:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                        >
                                            {example}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="w-full">
                            <ImageDisplay
                                imageSrc={generatedImage}
                                isLoading={isLoading}
                                loadingStep={loadingStep}
                                error={error}
                            />
                             <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-center">
                                <a
                                    href="https://feedback.waynerockett.com/zx-spectrum"
                                    className="flex-1 text-center bg-[#00D700] text-black py-2 px-3 text-xs hover:bg-[#00FF00] transition-colors duration-200"
                                >
                                    FEEDBACK
                                </a>
                                <a
                                    href="https://buymeacoffee.com/countdisoq"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 text-center bg-[#D7D700] text-black py-2 px-3 text-xs hover:bg-[#FFFF00] transition-colors duration-200"
                                >
                                    BUY ME A COFFEE
                                </a>
                                <a
                                    href="https://github.com/WayneRockett/ZX-Spectrum-Loading-Screen-Generator"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 text-center bg-[#00D7D7] text-black py-2 px-3 text-xs hover:bg-[#00FFFF] transition-colors duration-200"
                                >
                                    SOURCE CODE
                                </a>
                            </div>
                        </div>
                    </div>
                </main>
                <footer className="text-center mt-12 text-xs text-gray-500">
                    <p>(C) 1982-{new Date().getFullYear()} WAYNE ROCKETT</p>
                </footer>
            </div>
        </div>
    );
};

export default App;
