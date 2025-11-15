
import React from 'react';

interface PromptFormProps {
    prompt: string;
    setPrompt: (prompt: string) => void;
    onGenerate: () => void;
    isLoading: boolean;
    isLimitReached: boolean;
    generationsLeft: number;
}

export const PromptForm: React.FC<PromptFormProps> = ({ prompt, setPrompt, onGenerate, isLoading, isLimitReached, generationsLeft }) => {
    return (
        <div className="w-full flex flex-col space-y-4">
             <div className="flex justify-between items-end">
                <label htmlFor="prompt-input" className="text-lg text-[#00D7D7]">
                    10 PRINT "ENTER DESCRIPTION"
                </label>
                <p className="text-xs text-[#D7D700]">
                    {generationsLeft} left today
                </p>
            </div>
            <textarea
                id="prompt-input"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. A robot holding a red skateboard"
                disabled={isLoading || isLimitReached}
                rows={4}
                className="bg-[#0000D7] border-2 border-[#D7D7D7] text-white p-2 text-sm focus:outline-none focus:border-[#D7D700] resize-none placeholder:text-gray-400 disabled:opacity-50"
            />
            <button
                onClick={onGenerate}
                disabled={isLoading || isLimitReached}
                className="w-full bg-[#D70000] text-white py-3 text-lg hover:bg-[#FF0000] disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors duration-200"
            >
                {isLimitReached ? 'DAILY LIMIT REACHED' : isLoading ? 'LOADING...' : 'GENERATE SCREEN'}
            </button>
        </div>
    );
};
