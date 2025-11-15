
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
    "A pirate ship on a stormy sea",
    "A secret agent skiing down a mountain",
    "Dinosaurs rampaging through a prehistoric jungle",
    "A detective in a rainy, neon-lit alley",
    "A ghost inside a Victorian mansion",
    "An astronaut planting a flag on Mars",
    "A Formula 1 car racing to the finish line",
    "A submarine exploring a deep sea trench",
    "A barbarian fighting a giant snake",
    "A BMX biker doing a trick in a skatepark",
    "A robot rebellion in a futuristic factory",
    "A medieval castle under siege by a dragon",
    "Kids discovering a treasure map in an attic",
    "A post-apocalyptic survivor scavenging in ruins",
    "A heroic firefighter battling a blaze",
    "Giant ants attacking a picnic",
    "An archaeologist opening an Egyptian tomb",
    "A ninja sneaking across rooftops at midnight",
    "A mad scientist in a lab with bubbling beakers",
    "A tense penalty shootout in a packed stadium",
    "Space marine fighting aliens on a derelict starship",
    "A friendly alien visiting a suburban home",
    "A knight jousting at a royal tournament",
    "A treasure diver finding a sunken galleon",
    "A punk rocker on stage at a crowded concert",
];