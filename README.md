# Brunnr Frontend

A lightweight, modern web interface for the Brunnr Service API - transforming educational questions into animated videos through an intuitive user experience.

## 🎯 Overview

Brunnr Frontend provides a streamlined interface for generating educational videos using the Brunnr Service API. Built for speed and simplicity, it enables users to:

- 🚀 Generate videos from questions with a single click
- 📝 Control each step of the content pipeline
- ✏️ Edit and customize video manifests
- 📊 Analyze video timing and pacing
- 💾 Manage project history and downloads

## 🛠 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn/ui
- **Auth & Database**: Supabase
- **State Management**: Zustand + React Query
- **Deployment**: Vercel

## 📚 Documentation

All project documentation is located in the `_docs/` directory:

- [`project-overview.md`](_docs/project-overview.md) - High-level project goals
- [`user-flow.md`](_docs/user-flow.md) - Complete user journey mapping
- [`tech-stack.md`](_docs/tech-stack.md) - Technology decisions and patterns
- [`ui-rules.md`](_docs/ui-rules.md) - Design system and components
- [`theme-rules.md`](_docs/theme-rules.md) - Colors and visual styling
- [`project-rules.md`](_docs/project-rules.md) - Code standards and structure

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm/bun
- Supabase account and project
- Brunnr API key
- Vercel account (for deployment)

### Environment Variables

Create a `.env.local` file with:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Brunnr API
NEXT_PUBLIC_API_URL=https://brunnr-service-production.up.railway.app
BRUNNR_API_KEY=your_api_key

# Optional
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/brunnr-frontend.git
cd brunnr-frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 🏗 Development Phases

The project is structured in clear implementation phases. See [`_docs/phases/`](_docs/phases/) for detailed guides:

1. **Setup & Foundation** - Project initialization and auth
2. **MVP Core Features** - Video generation workflows
3. **Enhanced Features** - Manifest editing and analytics
4. **Polish & Deploy** - Final touches and production deployment

Each phase is designed to be implementable by an LLM agent with minimal context.

## 📁 Project Structure

```
brunnr-frontend/
├── src/
│   ├── app/              # Next.js app router
│   ├── components/       # React components
│   ├── lib/              # Utilities and configs
│   ├── hooks/            # Custom React hooks
│   ├── stores/           # Zustand stores
│   └── types/            # TypeScript types
├── public/               # Static assets
├── _docs/                # Project documentation
└── ...config files
```

## 🎨 Design System

The application follows a modern minimal design with:

- **Primary Color**: Deep blue (#1e3a8a) for navigation and CTAs
- **Secondary**: Emerald (#10b981) for success states
- **Tertiary**: Amber (#f59e0b) for warnings
- **Typography**: Inter font family
- **Spacing**: 4px base unit system

## 🔑 Key Features

### Quick Video Generation
Simple one-click flow from question to video:
```
Question → Context → Generate → Download
```

### Step-by-Step Pipeline
Full control over each phase:
```
Question → Explanation → Screenplay → Manifest → Video
```

### Manifest Editor
- Visual template builder
- JSON editor with validation
- Real-time preview
- Template library

### Analytics Dashboard
- Audio timing visualization
- Shot duration analysis
- Performance recommendations
- Export capabilities

## 🚀 Deployment

The application is designed for Vercel deployment:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod
```

## 🤝 Contributing

Please read the development documentation in `_docs/` before contributing. Follow the established patterns and conventions outlined in [`project-rules.md`](_docs/project-rules.md).

## 📄 License

[MIT License](LICENSE)

## 🙏 Acknowledgments

Built to showcase the capabilities of the [Brunnr Service API](https://brunnr-service-production.up.railway.app/docs) for educational video generation.
