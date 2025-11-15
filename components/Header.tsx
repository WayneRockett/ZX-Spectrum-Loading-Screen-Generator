
import React from 'react';

export const Header: React.FC = () => {
    return (
        <header className="text-center border-y-4 border-[#D7D700] py-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl text-[#00D7D7] tracking-wider">
                ZX SPECTRUM
            </h1>
            <h2 className="text-lg sm:text-xl md:text-2xl text-[#D700D7] mt-2">
                LOADING SCREEN GENERATOR
            </h2>
        </header>
    );
};
