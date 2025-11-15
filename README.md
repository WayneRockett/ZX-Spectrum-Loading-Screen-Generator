<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  10 REM *** ZX SPECTRUM LOADING SCREEN GENERATOR ***   ┃
┃  20 REM *** POWERED BY GOOGLE GEMINI AI ***            ┃
┃  30 PRINT "PROGRAM: NOSTALGIA.BAS"                     ┃
┃  40 LOAD ""                                            ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

# 🎮 ZX Spectrum Loading Screen Generator

> *BEEP! BEEP! BEEP!* Remember waiting for those glorious loading screens on cassette tape? Now you can generate your own with the power of modern AI! No tape deck required. No squealing audio. No 45-minute load times. Just pure, pixelated nostalgia in those iconic 15 colors (well, 16 if you count BRIGHT).

## 🎯 What's This All About Then?

This project was born from the [DEV.to Education Track: "Build Apps with Google AI Studio"](https://dev.to/devteam/announcing-the-first-dev-education-track-build-apps-with-google-ai-studio-ej7?bb=238626), and like any self-respecting retro computing enthusiast, we immediately thought: "What's the most 1980s thing we could build?" 

The answer, obviously, was a **ZX Spectrum Loading Screen Generator**.

### 🤖 How It Works (No Assembly Required)

1. **You type a prompt** - Describe the loading screen of your dreams
2. **Gemini rewrites it** - Making it more... *speccy* (that's a technical term)
3. **Imagen generates the image** - Using Google's image generation wizardry
4. **Magic quantisation happens** - We crush those millions of colours down to the authentic 15-colour ZX Spectrum palette
5. **LOAD "" COMPLETE** - Your glorious 256×192 masterpiece appears!

It's like waiting for a tape to load, but instead of hearing "EEEeeeEEEeeee" for 5 minutes, you get instant gratification. The future is now, folks!

## 🎨 The Spectrum Difference

For you youngsters who never experienced the glory days: the ZX Spectrum had 15 colors (8 standard + 7 BRIGHT variants, plus BLACK appearing twice). This wasn't a limitation - it was a FEATURE. Those constraints bred creativity! Artists became magicians, working within the iconic 8×8 attribute grid.

This app faithfully recreates that aesthetic because:
- **Colour clash is a feature, not a bug**
- **256×192 pixels is all you need**
- **If it's not flickering slightly, is it even retro?**

## 🚀 Getting Started (LOAD "")

### Prerequisites (Thankfully Easier Than Finding a Working Tape Deck)

- **Node.js** - Any modern version will do (we're not *that* retro)
- **A Gemini API Key** - Get one from [Google AI Studio](https://aistudio.google.com/)

### Installation (No Soldering Required)

```bash
# 1. Clone this repository (RUN command accepted)
git clone https://github.com/WayneRockett/ZX-Spectrum-Loading-Screen-Generator.git
cd ZX-Spectrum-Loading-Screen-Generator

# 2. Install dependencies (GOSUB package-manager)
npm install

# 3. Set up your API key (POKE into .env.local)
# Create a .env.local file and add:
# GEMINI_API_KEY=your_api_key_here

# 4. Start the dev server (LOAD "" and press PLAY)
npm run dev

# 5. Open your browser to http://localhost:5173
# BEEP! BEEP! Success!
```

### Building for Production (Ready for the Microdrive™)

```bash
npm run build
npm run preview
```

Your compiled app will be in the `dist` directory, ready for deployment to whatever cloud service you fancy. (Sorry, no actual microdrive support.)

## 🎪 Features (More Than 48K Could Handle)

- ✨ **AI-Powered Prompt Enhancement** - Gemini makes your prompts more authentic
- 🎨 **Authentic Color Quantization** - Proper 15-color Spectrum palette
- 💾 **Daily Generation Limits** - Because even in the future, we respect rate limits (3 per day to keep costs sensible)
- 📱 **Responsive Design** - Works on devices Sir Clive never dreamed of
- 🔊 **Silent Loading** - No tape loading sounds (add them yourself if you're feeling nostalgic)
- 🖼️ **Instant Results** - 2 seconds instead of 2 minutes (or 20 if you had a dodgy tape head)

## 🎯 Example Prompts to Get Started

Try these classics:
- "A brave knight battling a dragon"
- "A futuristic space station"
- "A mysterious forest with ancient ruins"
- "A cyberpunk city at night"
- "A pirate ship on stormy seas"

The AI will transform these into proper Spectrum-style imagery. Magic!

## 🛠️ Technology Stack (The Modern Stuff)

Built with all the fancy modern tools Sir Clive would have loved to have:

- **React 19** - For that sweet reactive UI
- **TypeScript** - Type safety (unlike BASIC line numbers)
- **Vite** - Lightning-fast builds
- **Google Gemini AI** - For prompt enhancement
- **Google Imagen** - For image generation
- **Tailwind CSS** - For styling (with authentic Spectrum colours)
- **Canvas API** - For color quantization magic

## 📖 Project Structure

```
ZX-Spectrum-Loading-Screen-Generator/
├── components/          # React components (Header, PromptForm, etc.)
├── services/           # API services for Gemini and Imagen
├── utils/              # Image processing utilities
├── constants.ts        # Example prompts and configuration
├── App.tsx             # Main application component
└── index.tsx           # Entry point (like 10 REM START)
```

## 🤝 Contributing (MERGE "" CODE Welcome!)

Found a bug? Want to add a feature? PRs are welcome! 

**Before you start:**
1. Check out our issue templates for bug reports, enhancements, questions, etc.
2. Fork the repo
3. Create a feature branch
4. Make your changes
5. Test thoroughly (no "R Tape loading error, 0:1" please)
6. Submit a PR with a clear description

## 🐛 Known Quirks (It's Not a Bug, It's Authentic)

- Daily generation limit is 3 images (to keep API costs reasonable)
- Colour quantisation is intentionally aggressive (it's the Spectrum way!)
- Some modern images don't translate perfectly to 15 colours (that's the charm)

## 📜 License

This project is open source. Share it, modify it, learn from it! Just like we all shared type-in programs from Sinclair User magazine.

## 🙏 Acknowledgments

- **DEV.to** - For the awesome Education Track program
- **Google AI Team** - For Gemini and Imagen APIs
- **Sir Clive Sinclair** - For the ZX Spectrum (RIP, you absolute legend)
- **All the bedroom coders of the 1980s** - You inspired this

## 🔗 Links

- **Live Demo**: [Try it yourself](https://zx-spectrum-generator.waynerockett.com) *(if deployed)*
- **DEV.to Education Track**: [Original announcement](https://dev.to/devteam/announcing-the-first-dev-education-track-build-apps-with-google-ai-studio-ej7?bb=238626)
- **AI Studio**: [View in Google AI Studio](https://ai.studio/apps/drive/15QGyQvI5wVQtkSybetZgfh6nmE-OH3Or)
- **Feedback**: [Share your thoughts](https://feedback.waynerockett.com/zx-spectrum)
- **Buy Me a Coffee**: [Support the project](https://buymeacoffee.com/countdisoq)

## 💬 Support & Questions

Having trouble? Check the [Issues](https://github.com/WayneRockett/ZX-Spectrum-Loading-Screen-Generator/issues) or open a new one using our question template.

---

```
10 PRINT "MADE WITH ♥ BY WAYNE ROCKETT"
20 PRINT "© 1982-2025 (TIME TRAVEL IS HARD)"
30 GOTO 10
```

**Remember**: In the 1980s, we waited 5 minutes for games to load from cassette tape. Now we complain if a website takes 3 seconds. This app bridges that gap - instant nostalgia! 🎮📼✨
