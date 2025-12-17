# YOBS - Your Own Bad Startup

🚀 AI-powered platform that generates intentionally terrible startup ideas, complete with landing pages and Telegram integration.

**You cannot refuse.**

## Screenshots

Coming soon...

## Features

- 🎲 **Bad Idea Generator** - AI generates absurd, impractical startup concepts
- 🌐 **Landing Page Generator** - Complete HTML export ready to deploy
- 📱 **Telegram Bot** - Auto-posts unconvincing marketing content
- 🖼️ **Image Generation** - Ugly logos and hero images (optional)

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React 19 |
| Backend | NestJS, Prisma |
| Database | PostgreSQL (Neon) |
| LLM | Groq (Llama 3.3 70B) |
| Images | Replicate (SDXL) |

## Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp apps/api/.env.example apps/api/.env
# Edit .env with your API keys

# Setup database
cd apps/api && npx prisma migrate dev

# Run development
npm run dev
```

## Environment Variables

```
GROQ_API_KEY=          # Required - Get from console.groq.com
DATABASE_URL=          # Required - PostgreSQL connection string
REPLICATE_API_KEY=     # Optional - For image generation
TELEGRAM_BOT_TOKEN=    # Optional - For Telegram bot
```

## Project Structure

```
yobs/
├── apps/
│   ├── api/          # NestJS backend
│   └── web/          # Next.js frontend
├── packages/
│   └── shared/       # Shared types
└── turbo.json
```

## License

MIT
