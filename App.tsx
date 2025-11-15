
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { PromptForm } from './components/PromptForm';
import { ImageDisplay } from './components/ImageDisplay';
import { rewritePrompt, generateImage } from './services/generationService';
import { quantizeImage } from './utils/imageProcessor';
import { EXAMPLE_PROMPTS } from './constants';

const App: React.FC = () => {
    const [prompt, setPrompt] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingStep, setLoadingStep] = useState<string>('');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = useCallback(async () => {
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

        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
            setLoadingStep('');
        }
    }, [prompt]);

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
                            />
                             <div>
                                <h2 className="text-lg mb-3 text-[#00D7D7]">TRY THESE...</h2>
                                <div className="flex flex-wrap gap-2">
                                    {EXAMPLE_PROMPTS.map((example, index) => (
                                        <button 
                                            key={index}
                                            onClick={() => handleExampleClick(example)}
                                            disabled={isLoading}
                                            className="bg-[#0000D7] text-white py-1 px-2 text-xs hover:bg-[#0000FF] disabled:bg-gray-700 transition-colors duration-200"
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
                        </div>
                    </div>
                </main>
                <footer className="text-center mt-12 text-xs text-gray-500">
                    <p>(C) 1982-2024 GEMINI-SPECCY INC.</p>
                </footer>
            </div>
        </div>
    );
};

export default App;
