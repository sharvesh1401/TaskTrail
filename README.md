# 🛤️ TaskTrail

**Your daily to-do list, reimagined as a journey.**  
TaskTrail turns everyday tasks into an engaging, goal-driven experience—complete with streaks, stars, and your own AI assistant TrailGuide.

---

## 🌟 What is TaskTrail?

TaskTrail is a beautifully minimal, dark-themed to-do app that doesn't just help you track tasks—it motivates you to *actually finish them*. Set clear goals, earn stars, build streaks, and let your AI sidekick "TrailGuide" give you a hand when you're stuck.

---

## ✨ Features

- ✅ Create, edit, complete, and auto-clean up tasks
- 🎯 Set goals and assign importance levels (e.g., "All-Out", "Chill")
- 🗓️ Duolingo-style streak calendar and customizable streak goals
- 🎉 Reward animations and golden badge when you meet your daily goal
- 🧠 AI assistant ("TrailGuide") powered by Groq API
- ⚙️ Settings panel for auto-delete and streak management
- 💬 Dynamic greetings that change with the time of day
- 🌌 Clean, animated UI with subtle interactive backgrounds
- 💾 Fully local—everything is stored on your device (with optional API calls)
- 📱 Fully responsive and mobile-first

## 🔐 Security Features

- **Secure API Key Management**: Groq API key stored in environment variables
- **Server-Side Processing**: All AI requests processed through secure serverless functions
- **No Client Exposure**: API keys never exposed to frontend or network requests
- **Git Security**: Environment files automatically ignored by version control

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tasktrail
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   The Groq API key is already configured securely in the environment files.

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:8080`

## 🤖 TrailGuide AI Assistant

TrailGuide is your intelligent productivity companion that provides:

- **Context-Aware Responses**: Understands your current tasks and goals
- **Task-Specific Guidance**: Detects when you need help with specific tasks
- **General Productivity Tips**: Offers advice on time management and goal setting
- **Secure Processing**: All conversations processed through encrypted serverless functions

### How TrailGuide Works

1. **Task Detection**: Automatically identifies when you're asking about specific tasks
2. **Context Building**: Includes relevant task details (title, goal, importance) in responses
3. **Conversation Memory**: Maintains conversation history for natural dialogue
4. **Security First**: All API calls processed server-side with encrypted keys

## 🛠️ Technical Architecture

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Vite** for fast development and building
- **Radix UI** components for accessibility

### Backend
- **Vercel Serverless Functions** for API endpoints
- **Groq API** for AI-powered responses
- **Secure Environment Variables** for API key management

### Security
- Environment variables stored in `.env.local` (git-ignored)
- Server-side API key injection
- CORS handling for cross-origin requests
- No client-side API key exposure

## 📱 Mobile Experience

TaskTrail is designed mobile-first with:
- Responsive design that works on all screen sizes
- Touch-optimized interactions
- Mobile-specific UI adaptations
- Consistent experience across devices

## 🎨 Design Philosophy

TaskTrail follows "Apple-level design aesthetics" with:
- **Meticulous Attention to Detail**: Every interaction is carefully crafted
- **Intuitive User Experience**: Natural, predictable interface patterns
- **Clean Visual Presentation**: Minimal, sophisticated design language
- **Thoughtful Animations**: Subtle micro-interactions that enhance usability

## 🔮 Future Enhancements

- Account creation and cross-device sync
- Advanced analytics and insights
- Team collaboration features
- Integration with calendar apps
- Customizable themes and layouts

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Transform your to-dos into a rewarding habit-building journey with TaskTrail!** 🛤️✨