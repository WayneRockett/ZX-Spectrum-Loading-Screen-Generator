import React, { useState, useRef } from 'react';
import { convertImageToScr, downloadScrFile } from '../utils/scrConverter';
import { ArrowLeft } from './icons';

interface ImageToScrProps {
    onBack: () => void;
}

export const ImageToScr: React.FC<ImageToScrProps> = ({ onBack }) => {
    const [sourceImage, setSourceImage] = useState<string | null>(null);
    const [scrPreview, setScrPreview] = useState<string | null>(null);
    const [scrData, setScrData] = useState<Uint8Array | null>(null);
    const [isConverting, setIsConverting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [filename, setFilename] = useState<string>('screen.scr');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Reset previous state
        setScrPreview(null);
        setScrData(null);
        setError(null);

        // Extract filename without extension
        const name = file.name.replace(/\.[^/.]+$/, '');
        setFilename(`${name}.scr`);

        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            setSourceImage(dataUrl);
        };
        reader.onerror = () => {
            setError('Failed to read file');
        };
        reader.readAsDataURL(file);
    };

    const handleConvert = async () => {
        if (!sourceImage) return;

        setIsConverting(true);
        setError(null);

        try {
            const result = await convertImageToScr(sourceImage);
            setScrData(result.scrData);
            setScrPreview(result.previewDataUrl);
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Conversion failed');
        } finally {
            setIsConverting(false);
        }
    };

    const handleDownload = () => {
        if (!scrData) return;
        downloadScrFile(scrData, filename);
    };

    const handleSelectFile = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="min-h-screen bg-black flex flex-col items-center p-4 sm:p-6 md:p-8">
            <div className="w-full max-w-4xl">
                <header className="text-center border-y-4 border-[#D7D700] py-4">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl text-[#00D7D7] tracking-wider">
                        IMAGE TO .SCR CONVERTER
                    </h1>
                </header>

                <main className="mt-8">
                    <div className="mb-6">
                        <button
                            onClick={onBack}
                            className="flex items-center gap-2 bg-[#D70000] text-white py-2 px-4 text-sm hover:bg-[#FF0000] transition-colors duration-200"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            BACK TO GENERATOR
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left column - Input */}
                        <div className="flex flex-col space-y-4">
                        {scrPreview === null &&
                            <div>
                                <h2 className="text-lg mb-3 text-[#00D7D7]">1. SELECT IMAGE FILE</h2>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                                <button
                                    onClick={handleSelectFile}
                                    className="w-full bg-[#0000D7] text-white py-3 px-4 text-sm hover:bg-[#0000FF] transition-colors duration-200"
                                >
                                    CHOOSE FILE
                                </button>
                            </div>
                        }

                            {sourceImage && (
                                <div>
                                    <h3 className="text-sm mb-2 text-[#00D7D7]">SOURCE IMAGE</h3>
                                    <div className="border-4 border-[#D7D7D7] bg-black p-2">
                                        <img 
                                            src={sourceImage} 
                                            alt="Source" 
                                            className="w-full h-auto"
                                            style={{ imageRendering: 'pixelated' }}
                                        />
                                    </div>
                                </div>
                            )}

                            {sourceImage && !scrPreview && (
                                <div>
                                    <h2 className="text-lg mb-3 text-[#00D7D7]">2. CONVERT TO .SCR</h2>
                                    <button
                                        onClick={handleConvert}
                                        disabled={isConverting}
                                        className="w-full bg-[#00D700] text-black py-3 px-4 text-sm hover:bg-[#00FF00] disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors duration-200"
                                    >
                                        {isConverting ? 'CONVERTING...' : 'CONVERT'}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Right column - Output */}
                        <div className="flex flex-col space-y-4">
                            {scrPreview && (
                                <>
                                    <div>
                                        <h3 className="text-sm mb-2 text-[#00D7D7]">ZX SPECTRUM .SCR PREVIEW</h3>
                                        <div className="border-4 border-[#D7D7D7] bg-black p-2">
                                            <img 
                                                src={scrPreview} 
                                                alt="SCR Preview" 
                                                className="w-full h-auto"
                                                style={{ imageRendering: 'pixelated' }}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <h2 className="text-lg mb-3 text-[#00D7D7]">3. DOWNLOAD .SCR FILE</h2>
                                        <button
                                            onClick={handleDownload}
                                            className="w-full bg-[#D7D700] text-black py-3 px-4 text-sm hover:bg-[#FFFF00] transition-colors duration-200"
                                        >
                                            DOWNLOAD {filename}
                                        </button>
                                    </div>

                                    <div className="bg-[#0000D7] p-4 text-white text-xs">
                                        <p className="font-bold mb-2">FORMAT INFO:</p>
                                        <p>• Resolution: 256×192 pixels</p>
                                        <p>• File size: 6912 bytes</p>
                                        <p>• 6144 bytes bitmap data</p>
                                        <p>• 768 bytes attributes</p>
                                        <p>• 8×8 character cells</p>
                                    </div>
                                </>
                            )}

                            {error && (
                                <div className="bg-[#D70000] p-4 text-white text-sm">
                                    <p className="font-bold mb-1">ERROR:</p>
                                    <p>{error}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-8 bg-[#00D7D7] text-black p-4 text-xs">
                        <p className="font-bold mb-2">ABOUT .SCR FILES:</p>
                        <p className="mb-1">
                            ZX Spectrum .SCR files contain a complete screen image in the native format used by the 
                            ZX Spectrum computer. Each 8×8 pixel block can display two colors from the 15-color 
                            palette. The converter automatically selects the best two colors for each block and 
                            creates a bitmap representation.
                        </p>
                        <p>
                            These files can be loaded directly on ZX Spectrum hardware or emulators.
                        </p>
                    </div>
                </main>

                <footer className="text-center mt-12 text-xs text-gray-500">
                    <p>(C) 1982-{new Date().getFullYear()} WAYNE ROCKETT</p>
                </footer>
            </div>
        </div>
    );
};
