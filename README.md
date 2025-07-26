# DSA Companion

An AI-powered learning companion for Data Structures and Algorithms that creates personalized problem-solving experiences.

## Features

- **AI Problem Generation**: Generate custom DSA problems based on user preferences and difficulty levels
- **Interactive Problem Solving**: Solve problems directly in the app with real-time code execution
- **AI Guidance**: Get hints, explanations, and step-by-step guidance when stuck
- **Solution Validation**: AI checks your solutions against multiple test cases
- **Optimization Suggestions**: Get hints for better solutions and time/space complexity improvements
- **Learning Reinforcement**: Quizzes and supplementary materials to reinforce concepts
- **Progress Tracking**: Track your learning journey and problem-solving skills

## Tech Stack

- **Frontend**: React.js with TypeScript, Tailwind CSS, Monaco Editor
- **Backend**: Node.js with Express, TypeScript
- **AI Integration**: OpenAI API for problem generation and solution validation
- **Code Execution**: Docker-based sandbox for safe code execution
- **Database**: SQLite for user progress and problem history

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dsa-companion
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Add your OpenAI API key to .env
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

## Project Structure

```
dsa-companion/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API services
│   │   └── types/         # TypeScript types
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Express middleware
│   │   ├── services/      # Business logic
│   │   └── utils/         # Utility functions
└── shared/                 # Shared types and utilities
```

## Environment Variables

Create a `.env` file in the root directory:

```env
OPENAI_API_KEY=your_openai_api_key_here
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details 