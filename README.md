<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  10 REM *** ZX SPECTRUM LOADING SCREEN GENERATOR ***   ┃
┃  20 REM *** POWERED BY FLUX.1 SCHNELL ***              ┃
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
2. **The server adds the Speccy styling** - The browser never receives the model API token
3. **FLUX.1 Schnell generates the image** - Using Replicate's hosted API
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
- **A Replicate API token** - Create one in your [Replicate account](https://replicate.com/account/api-tokens)
- **An Upstash Redis database** - Used for server-side generation limits
- **Vercel CLI** - Required to run the API route locally (`npm install --global vercel`)

### Installation (No Soldering Required)

```bash
# 1. Clone this repository (RUN command accepted)
git clone https://github.com/WayneRockett/ZX-Spectrum-Loading-Screen-Generator.git
cd ZX-Spectrum-Loading-Screen-Generator

# 2. Install dependencies (GOSUB package-manager)
npm install

# 3. Set up the server-only environment variables (POKE into .env.local)
# Create a .env.local file and add:
# REPLICATE_API_TOKEN=your_replicate_token
# UPSTASH_REDIS_REST_URL=your_upstash_rest_url
# UPSTASH_REDIS_REST_TOKEN=your_upstash_rest_token
#
# Optional limits (defaults shown):
# PER_IP_DAILY_LIMIT=3
# GLOBAL_DAILY_LIMIT=100
# GENERATION_COOLDOWN_SECONDS=20

# 4. Start the dev server (LOAD "" and press PLAY)
npm run dev:vercel

# 5. Open the URL printed by Vercel CLI (normally http://localhost:3000)
# BEEP! BEEP! Success!
```

`npm run dev` still starts the Vite frontend by itself, but image generation needs
`npm run dev:vercel` so the `/api/generate` serverless function is available.

### Building for Production (Ready for the Microdrive™)

```bash
npm run build
npm run preview
```

Your compiled app will be in the `dist` directory, ready for deployment to whatever cloud service you fancy. (Sorry, no actual microdrive support.)

### Deploying to Vercel

The live deployment is [zxspectrum.waynerockett.com](https://zxspectrum.waynerockett.com/).
The frontend and `api/generate.ts` can remain in the same Vercel project.

1. Create a [Replicate API token](https://replicate.com/account/api-tokens), buy a small
   amount of prepaid credit, and leave **auto reload disabled**.
2. Create an Upstash Redis database. You can do this through the Vercel Marketplace or
   directly in Upstash.
3. Add these variables in **Vercel → Project → Settings → Environment Variables** for
   Production, Preview, and Development as appropriate:
   - `REPLICATE_API_TOKEN`
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
   
   Vercel may instead create the legacy aliases `KV_REST_API_URL` and
   `KV_REST_API_TOKEN`; the application supports either complete pair.
   - `PER_IP_DAILY_LIMIT` (optional, default `3`)
   - `GLOBAL_DAILY_LIMIT` (optional, default `100`)
   - `GENERATION_COOLDOWN_SECONDS` (optional, default `20`)
4. Remove the old `GEMINI_API_KEY` from Vercel and redeploy. Vercel should continue to
   detect the project as Vite; no framework or build-command override is required.

Every accepted generation attempt counts towards both daily limits, including attempts
where the image provider later fails. This fail-closed behaviour ensures the global
limit is a real upper bound on calls to the paid API. With FLUX.1 Schnell currently
priced at about $0.003 per image, the default global limit represents roughly $0.30 of
model usage per day. Replicate's prepaid balance, with auto reload disabled, provides
the final account-level spending stop.

## 🎪 Features (More Than 48K Could Handle)

- ✨ **AI-Powered Image Generation** - FLUX.1 Schnell creates the source artwork
- 🎨 **Authentic Color Quantization** - Proper 15-color Spectrum palette
- 💾 **Server-Enforced Limits** - Per-IP, cooldown, and global daily limits keep costs sensible
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
- **Replicate / FLUX.1 Schnell** - For low-cost image generation
- **Vercel Functions** - Keeps provider credentials on the server
- **Upstash Redis** - Enforces atomic usage limits across serverless instances
- **Tailwind CSS** - For styling (with authentic Spectrum colours)
- **Canvas API** - For color quantization magic

## 📖 Project Structure

```
ZX-Spectrum-Loading-Screen-Generator/
├── components/          # React components (Header, PromptForm, etc.)
├── api/                # Server-side image generation endpoint
├── services/           # Browser-safe API client
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
- A site-wide daily limit defaults to 100 generation attempts
- Colour quantisation is intentionally aggressive (it's the Spectrum way!)
- Some modern images don't translate perfectly to 15 colours (that's the charm)

## 📜 License

This project is open source. Share it, modify it, learn from it! Just like we all shared type-in programs from Sinclair User magazine.

## 🙏 Acknowledgments

- **DEV.to** - For the awesome Education Track program
- **Black Forest Labs** - For FLUX.1 Schnell
- **Replicate** - For hosting the image model
- **Sir Clive Sinclair** - For the ZX Spectrum (RIP, you absolute legend)
- **All the bedroom coders of the 1980s** - You inspired this

## 🔗 Links

- **Live Demo**: [Try it yourself](https://zxspectrum.waynerockett.com/)
- **DEV.to Education Track**: [Original announcement](https://dev.to/devteam/announcing-the-first-dev-education-track-build-apps-with-google-ai-studio-ej7?bb=238626)
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
