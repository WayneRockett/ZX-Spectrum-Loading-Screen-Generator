
// ZX Spectrum 15-color palette
// Normal and Bright variants. Bright White is same as Normal White.
export const SPECTRUM_PALETTE_HEX = [
    '#000000', // Black
    '#0000D7', // Blue
    '#D70000', // Red
    '#D700D7', // Magenta
    '#00D700', // Green
    '#00D7D7', // Cyan
    '#D7D700', // Yellow
    '#D7D7D7', // White
    '#0000FF', // Bright Blue
    '#FF0000', // Bright Red
    '#FF00FF', // Bright Magenta
    '#00FF00', // Bright Green
    '#00FFFF', // Bright Cyan
    '#FFFF00', // Bright Yellow
    '#FFFFFF', // Bright White (same as D7D7D7 but often rendered as FFFFFF)
];

export const SPECTRUM_PALETTE_RGB: [number, number, number][] = SPECTRUM_PALETTE_HEX.map(hex => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
});


export const EXAMPLE_PROMPTS = [
    "Knight exploring a haunted forest",
    "Starfighter escaping an alien base",
    "Footballer celebrating a last-minute cup winner",
    "A wizard in a high tower full of potions",
    "Cyberpunk city street at night",
];
