# BluePrint - AI-Powered College Opportunity Platform

BluePrint is an intelligent platform designed to help college students discover opportunities, build compelling profiles, and navigate their academic and career journeys with AI-powered guidance.

## 🎯 What is BluePrint?

BluePrint is a comprehensive platform that helps college students:

- **Discover Opportunities**: Find internships, research positions, community service roles, and extracurricular activities tailored to their interests and goals
- **Build Compelling Stories**: Create cohesive narratives that link academic interests, extracurricular activities, and career aspirations
- **Profile Context**: Provide detailed profile information to receive personalized recommendations
- **Technology Understanding**: Learn about the AI technology powering the platform
- **Admitted Profiles**: Explore successful student profiles and their pathways

## 🚀 Features

### Core Functionality
- **AI-Powered Chat Interface**: Interactive chat with rotating placeholder prompts focused on opportunities and student stories
- **Profile Management**: Comprehensive profile system for personalized recommendations
- **Knowledge Base Integration**: Advanced search capabilities with Supabase vector embeddings
- **Authentication**: Secure user authentication with Supabase
- **Responsive Design**: Modern, mobile-friendly interface with Tailwind CSS

### Key Pages
- **Home**: Main chat interface with opportunity discovery
- **Profile Context**: Detailed profile setup and management
- **Personal Blueprint**: Individual student roadmap creation
- **Technology**: Platform technology explanation
- **Application Context**: Application-specific guidance
- **Admitted Profiles**: Success stories and pathway examples

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **React Router** for client-side routing
- **Tailwind CSS** for styling
- **shadcn/ui** for component library
- **Radix UI** for accessible components
- **Lucide React** for icons

### Backend & Services
- **Supabase** for database, authentication, and vector search
- **OpenAI API** for AI chat completions
- **React Query** for data fetching and caching
- **React Hook Form** with Zod validation

### Development Tools
- **TypeScript** for type safety
- **ESLint** for code linting
- **PostCSS** for CSS processing
- **tsx** for TypeScript execution

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js (v18 or higher) - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <YOUR_GIT_URL>
   cd blue-iec
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory with:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_OPENAI_API_KEY=your_openai_api_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run ingest:jsonl` - Ingest knowledge base data

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── ChatBot.tsx     # Main chat interface
│   ├── ProfileCard.tsx # Profile display component
│   └── ...
├── pages/              # Route components
│   ├── Index.tsx       # Home page
│   ├── Auth.tsx        # Authentication
│   ├── ProfileContext.tsx
│   └── ...
├── hooks/              # Custom React hooks
├── integrations/       # External service integrations
│   ├── openai/         # OpenAI API client
│   └── supabase/       # Supabase client and utilities
├── lib/                # Utility functions
└── config/             # Configuration files
```

## 🔧 Configuration

### Supabase Setup
1. Create a new Supabase project
2. Set up the database schema using the migration files in `supabase/migrations/`
3. Configure Row Level Security (RLS) policies
4. Set up vector embeddings for the knowledge base

### OpenAI Integration
1. Get an OpenAI API key
2. Configure the API key in your environment variables
3. The system uses GPT models for chat completions and knowledge retrieval

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Deployment Options
- **Vercel**: Connect your GitHub repository for automatic deployments
- **Netlify**: Deploy with continuous integration
- **Supabase**: Use Supabase's hosting capabilities

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is private and proprietary. All rights reserved.

## 🆘 Support

For support and questions:
- Check the documentation in the `/docs` folder
- Review the code comments and TypeScript types
- Open an issue for bugs or feature requests

---

**Built with ❤️ for college students seeking their next opportunity**
