import React from 'react';
import { DownloadIcon } from './icons';

interface ImageDisplayProps {
    imageSrc: string | null;
    isLoading: boolean;
    loadingStep: string;
    error: string | null;
}

const LoadingIndicator: React.FC<{ step: string }> = ({ step }) => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black text-[#00D700] p-4">
        <div className="animate-pulse">{step}</div>
        <div className="w-full h-1 mt-4 bg-gray-800 overflow-hidden">
             <div className="h-full bg-gradient-to-r from-[#00D7D7] to-[#D700D7] animate-loading-bar"></div>
        </div>
         <style>{`
            @keyframes loading-bar {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
            }
            .animate-loading-bar {
                animation: loading-bar 1.5s linear infinite;
            }
        `}</style>
    </div>
);

const Placeholder: React.FC = () => (
     <div className="w-full h-full flex items-center justify-center bg-black text-center p-4">
        <p className="text-gray-500">
          IMAGE WILL APPEAR HERE...<br/><br/>
          READY.
        </p>
    </div>
);

export const ImageDisplay: React.FC<ImageDisplayProps> = ({ imageSrc, isLoading, loadingStep, error }) => {
    return (
        <div className="w-full aspect-[256/192] bg-[#0000D7] p-2 relative">
            <div className="w-full h-full bg-black relative overflow-hidden">
                {isLoading && <LoadingIndicator step={loadingStep} />}
                {!isLoading && !imageSrc && !error && <Placeholder />}
                {error && !isLoading && (
                    <div className="w-full h-full flex items-center justify-center text-center p-4 text-[#FF0000]">
                        <p>ERROR: <br/> {error}</p>
                    </div>
                )}
                {imageSrc && !isLoading && (
                    <img src={imageSrc} alt="Generated ZX Spectrum loading screen" className="w-full h-full object-contain pixelated" />
                )}
            </div>
             {imageSrc && !isLoading && (
                 <a
                    href={imageSrc}
                    download="zx_spectrum_screen.png"
                    className="absolute top-4 right-4 bg-[#D70000] p-2 text-white hover:bg-[#FF0000] transition-colors"
                    aria-label="Download Image"
                >
                   <DownloadIcon className="w-6 h-6" />
                </a>
            )}
        </div>
    );
};