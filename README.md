# Manim Animation Generator

A full-stack web application for generating [Manim](https://www.manim.community/) animations using multiple AI models, including OpenAI GPT, Google's Gemini, and Groq.

## 🚀 Features

- **AI-Powered Animation Generation**: Use natural language prompts to create mathematical animations
- **Multiple AI Models**: Switch between OpenAI, Gemini, and Groq models
- **Real-time Progress Tracking**: Monitor generation status through WebSocket integration
- **User Authentication**: Secure signup, login, and session management
- **Animation History**: Access and re-generate previous animations
- **Video Rendering**: Convert Manim code to MP4 videos automatically

## 📋 Technical Details

This project is a full-stack JavaScript application with:

### Backend

- Express.js server
- PostgreSQL database with Drizzle ORM
- Passport.js for authentication
- WebSocket server for real-time updates
- Integration with multiple AI APIs:
  - OpenAI API
  - Google AI (Gemini) API
  - Groq API

### Frontend

- React with Vite
- TailwindCSS and shadcn/ui components
- React Query for data fetching
- WebSocket client for real-time updates

## 🔧 Setup

### Prerequisites

- Node.js (v18+)
- PostgreSQL database
- Required API keys:
  - OpenAI API key
  - Google AI API key (optional)
  - Groq API key (optional)

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/animation_generator

# Authentication
SESSION_SECRET=your_secret_key_here

# AI API Keys
OPENAI_API_KEY=your_openai_api_key
GOOGLE_AI_API_KEY=your_google_ai_api_key
GROQ_API_KEY=your_groq_api_key
```

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/manim-animation-generator.git
   cd manim-animation-generator
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up the database:
   ```
   npm run db:push
   ```

4. Start the development server:
   ```
   npm run dev
   ```

## 🧪 API Endpoints

### Authentication

- `POST /api/auth/signup`: Create a new user account
- `POST /api/auth/login`: Authenticate a user
- `POST /api/auth/logout`: End the current user session
- `GET /api/auth/user`: Get the current authenticated user

### Animations

- `GET /api/animations`: Get all animations for the current user
- `GET /api/animations/:id`: Get details for a specific animation
- `POST /api/animations`: Create a new animation from a prompt
- `POST /api/animations/:id/regenerate`: Regenerate an existing animation

## 🔌 WebSocket Events

The application uses WebSocket for real-time updates on animation generation progress:

- **Connected**: Notifies when client successfully connects to WebSocket server
- **TaskUpdate**: Provides updates on generation tasks (script creation, code generation, rendering)
- **Error**: Notifies of any errors during the generation process

## 📝 Usage Limits

Each user is limited to 10 free generation requests to prevent abuse of the system and API resources.

## 💻 Development

### Project Structure

```
├── client/                # Frontend code
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions
│   │   ├── pages/         # Page components
│   │   └── App.tsx        # Main application component
├── server/                # Backend code
│   ├── services/          # Service modules
│   │   ├── ai.ts          # AI integration service
│   │   ├── animation.ts   # Animation management
│   │   ├── auth.ts        # Authentication service
│   │   └── manim.ts       # Manim rendering service
│   ├── auth.ts            # Authentication setup
│   ├── db.ts              # Database connection
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Data access layer
│   └── vite.ts            # Vite integration
└── shared/                # Shared code
    └── schema.ts          # Database schema and types
```

## 📚 Libraries Used

- **Frontend**:
  - React, Vite, TailwindCSS, shadcn/ui
  - React Query for data fetching
  - WebSocket for real-time updates

- **Backend**:
  - Express.js for API server
  - Passport.js for authentication
  - Drizzle ORM for database access
  - ws for WebSocket server

- **AI Integration**:
  - OpenAI Node.js SDK
  - Google AI SDK
  - Groq JavaScript client

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.