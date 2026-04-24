import React from 'react';

interface AnnouncementPopupProps {
    onClose: () => void;
}

export const AnnouncementPopup: React.FC<AnnouncementPopupProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="bg-[#000080] border-4 border-[#D7D7D7] max-w-lg w-full p-6 flex flex-col space-y-4 shadow-2xl">
                {/* Title bar */}
                <div className="bg-[#D70000] px-3 py-1 text-white text-sm font-bold tracking-widest text-center">
                    *** IMPORTANT MESSAGE ***
                </div>

                {/* Body */}
                <div className="text-[#D7D7D7] text-sm leading-relaxed space-y-3">
                    <p>
                        Well folks, it seems like some of those <span className="text-[#D7D700] font-bold">Commodore 64</span> people have found the site. They have been asking the AI to do things it should not do.
                    </p>
                    <p>
                        As I only really made this site as a bit of fun for a Google course, I've just <span className="text-[#FF0000] font-bold">turned off the ability to generate images</span>. Hopefully when I get chance I will put it back, ensuring it cannot be exploited in any way.
                    </p>
                    <p>
                        Really didn't expect this from a simple ZX Speccy site!
                    </p>
                    <p className="border border-[#00D7D7] p-2 text-[#00D7D7]">
                        🕹️ The good news — the ability to <span className="font-bold">convert images to .SCR files</span> is still fully available for you to enjoy!
                    </p>
                </div>

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="w-full bg-[#D70000] text-white py-2 text-sm tracking-widest hover:bg-[#FF0000] transition-colors duration-200 font-bold"
                >
                    OK, GOT IT — CLOSE
                </button>
            </div>
        </div>
    );
};
