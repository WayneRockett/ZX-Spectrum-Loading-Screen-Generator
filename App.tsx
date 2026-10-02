
import React, { useState, useCallback, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { Header } from './components/Header';
import { PromptForm } from './components/PromptForm';
import { ImageDisplay } from './components/ImageDisplay';
import { MaintenanceScreen } from './components/MaintenanceScreen';
import { ImageToScr } from './components/ImageToScr';
import {
    generateImage,
    GenerationLimitError,
    getGenerationStatus,
    QuotaExceededError,
} from './services/generationService';
import { quantizeImage } from './utils/imageProcessor';
import { EXAMPLE_PROMPTS } from './constants';

const DAILY_LIMIT = 3;

// Helper to get N random prompts from the main list
const getRandomPrompts = (allPrompts: string[], count: number): string[] => {
    const shuffled = [...allPrompts].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};

const App: React.FC = () => {
    const [prompt, setPrompt] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingStep, setLoadingStep] = useState<string>('');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [displayPrompts, setDisplayPrompts] = useState<string[]>([]);
    const [generationsLeft, setGenerationsLeft] = useState<number>(DAILY_LIMIT);
    const [isMaintenanceMode, setIsMaintenanceMode] = useState<boolean>(false);
    const [showConverter, setShowConverter] = useState<boolean>(false);

    const isLimitReached = generationsLeft <= 0;

    useEffect(() => {
        setDisplayPrompts(getRandomPrompts(EXAMPLE_PROMPTS, 5));
        getGenerationStatus()
            .then(setGenerationsLeft)
            .catch((statusError) => console.error('Unable to load generation allowance:', statusError));
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
            setLoadingStep('GENERATING IMAGE...');
            const result = await generateImage(prompt);
            const imageDataUrl = `data:${result.mimeType};base64,${result.base64}`;

            setLoadingStep('QUANTIZING COLOURS...');
            const quantizedImage = await quantizeImage(imageDataUrl);
            setGeneratedImage(quantizedImage);
            setGenerationsLeft(result.remaining);
        } catch (err) {
            console.error(err);
            if (err instanceof GenerationLimitError) {
                setGenerationsLeft(err.remaining);
                setError(err.message);
            } else if (err instanceof QuotaExceededError) {
                setIsMaintenanceMode(true);
            } else {
                setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            }
        } finally {
            setIsLoading(false);
            setLoadingStep('');
        }
    }, [prompt, isLimitReached]);

    const handleExampleClick = (example: string) => {
        setPrompt(example);
    };

    const handleRetry = () => {
        setIsMaintenanceMode(false);
        setError(null);
    };

    // Show maintenance screen if API quota is exceeded
    if (isMaintenanceMode) {
        return <MaintenanceScreen onRetry={handleRetry} />;
    }

    // Show converter screen
    if (showConverter) {
        return <ImageToScr onBack={() => setShowConverter(false)} />;
    }

    return (
        <>
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
                                <div className="mt-2 flex justify-center">
                                    <button
                                        onClick={() => setShowConverter(true)}
                                        className="w-full bg-[#D700D7] text-white py-2 px-3 text-xs hover:bg-[#FF00FF] transition-colors duration-200"
                                    >
                                        CONVERT IMAGE TO .SCR
                                    </button>
                                </div>
                            </div>
                        </div>
                    </main>
                    <footer className="text-center mt-12 text-xs text-gray-500">
                        <p>(C) 1982-{new Date().getFullYear()} WAYNE ROCKETT</p>
                    </footer>
                </div>
            </div>
            <Analytics />
        </>
    );
};

export default App;
