import React from 'react';

interface MaintenanceScreenProps {
    onRetry?: () => void;
}

export const MaintenanceScreen: React.FC<MaintenanceScreenProps> = ({ onRetry }) => {
    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                {/* Border frame with ZX Spectrum colors */}
                <div className="border-4 border-[#D7D700] bg-[#0000D7] p-4">
                    <div className="bg-black p-8 text-center">
                        {/* Flashing maintenance message */}
                        <div className="text-3xl sm:text-4xl md:text-5xl text-[#FF0000] mb-8 animate-pulse font-mono tracking-wider">
                            DOWN FOR MAINTENANCE
                        </div>
                        
                        {/* Message box */}
                        <div className="border-2 border-[#00D7D7] p-6 mb-6">
                            <pre className="text-[#00D7D7] text-left text-xs sm:text-sm whitespace-pre-wrap font-mono">
{`10 REM *** SYSTEM STATUS ***
20 PRINT "API QUOTA EXCEEDED"
30 PRINT ""
40 PRINT "DAILY GENERATION LIMIT"
50 PRINT "HAS BEEN REACHED"
60 PRINT ""
70 PRINT "SERVICE WILL RESUME"
80 PRINT "TOMORROW AT 00:00 UTC"
90 PRINT ""
100 PRINT "SORRY FOR THE"
110 PRINT "INCONVENIENCE..."
120 END`}
                            </pre>
                        </div>

                        {/* Additional info */}
                        <div className="text-[#D700D7] text-sm mb-6 font-mono">
                            <p className="mb-2">R TAPE LOADING ERROR</p>
                            <p>PLEASE TRY AGAIN LATER</p>
                        </div>

                        {/* Retry button */}
                        {onRetry && (
                            <button
                                onClick={onRetry}
                                className="bg-[#00D700] text-black py-3 px-6 text-sm font-mono hover:bg-[#00FF00] transition-colors duration-200 tracking-wider"
                            >
                                RETRY CONNECTION
                            </button>
                        )}
                        
                        {/* Loading bars animation */}
                        <div className="mt-8 space-y-2">
                            <div className="h-2 bg-gray-800 overflow-hidden">
                                <div className="h-full bg-[#00D7D7] animate-loading-bar"></div>
                            </div>
                            <div className="h-2 bg-gray-800 overflow-hidden">
                                <div className="h-full bg-[#D700D7] animate-loading-bar-slow"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer info */}
                <div className="text-center mt-6 text-xs text-gray-500 font-mono">
                    <p>(C) 1982-{new Date().getFullYear()} WAYNE ROCKETT</p>
                    <p className="mt-2">CHECK BACK SOON!</p>
                </div>
            </div>

            <style>{`
                @keyframes loading-bar {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                @keyframes loading-bar-slow {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-loading-bar {
                    animation: loading-bar 1.5s linear infinite;
                }
                .animate-loading-bar-slow {
                    animation: loading-bar-slow 2.5s linear infinite;
                }
            `}</style>
        </div>
    );
};
