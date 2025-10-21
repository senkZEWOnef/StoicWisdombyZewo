# Eudaimon by Zewo

A comprehensive personal development and life tracking application built with React and Node.js, designed to help users achieve eudaimonia (human flourishing) while managing their daily life through journaling, goal tracking, and mindful habits.

## 🌟 Overview

Eudaimon by Zewo is a modern web application that combines ancient wisdom with contemporary life management tools. It provides users with a holistic platform to track their physical health, mental well-being, daily activities, and personal growth through various interconnected modules.

## ✨ Key Features

### 📖 **Journal & Reflection**
- Daily journaling with mood tracking
- Rich text entries with timestamps
- Reflection prompts based on stoic principles
- Historical journal browsing and search

### 🎯 **Goal & Habit Tracking**
- Daily, weekly, and monthly goal setting
- Habit tracking with streak counters
- Progress visualization and analytics
- Customizable goal categories (work, personal, health)

### 💪 **Fitness & Wellness**
- Workout planning and tracking
- Exercise library with custom workouts
- Progress photos and measurements
- Recovery and rest day planning

### 🍽️ **Nutrition Management**
- Meal planning and tracking
- Photo-based meal logging
- Calorie and macro tracking
- Nutrition goal setting

### 📚 **Personal Library**
- Book tracking and reviews
- Reading progress monitoring
- Book recommendations and wishlist
- Cover photo uploads

### 💡 **Ideas & Notes**
- Quick capture of thoughts and ideas
- Categorized note-taking
- Tag-based organization
- Search and filtering capabilities

### 📅 **Calendar & Scheduling**
- Event planning and tracking
- Reminder system
- Goal deadline management
- Daily/weekly/monthly views

### 🧠 **Mood & Wisdom**
- Daily mood tracking with analytics
- Stoic quotes and daily wisdom
- Mood correlation with activities
- Mental health insights

### 📊 **Analytics & Export**
- Comprehensive data visualization
- Progress reports and insights
- Data export functionality
- Historical trend analysis

## 🏗️ Technical Architecture

### Frontend
- **Framework**: React 19.1.0 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Icons**: Lucide React for consistent iconography
- **Routing**: React Router DOM for SPA navigation
- **State Management**: React Context API for authentication
- **Build Tool**: Vite for fast development and building

### Backend
- **Runtime**: Node.js with Express 5.1.0
- **Database**: SQLite with PostgreSQL support
- **Authentication**: JWT (JSON Web Tokens) with bcryptjs
- **File Upload**: Multer for image handling
- **Security**: CORS enabled, environment variables

### Key Dependencies
```json
{
  "react": "^19.1.0",
  "typescript": "~5.8.3",
  "tailwindcss": "^3.4.17",
  "lucide-react": "^0.542.0",
  "express": "^5.1.0",
  "jsonwebtoken": "^9.0.2",
  "bcryptjs": "^3.0.2",
  "sqlite3": "^5.1.7",
  "multer": "^2.0.2"
}
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd StoicWisdombyZewo
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd server
   npm install
   cd ..
   ```

4. **Environment Setup**
   Create a `.env` file in the server directory:
   ```env
   JWT_SECRET=your_jwt_secret_here
   PORT=5001
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd server
   npm start
   ```
   Server runs on `http://localhost:5001`

2. **Start the frontend development server**
   ```bash
   npm run dev
   ```
   Frontend runs on `http://localhost:5173`

### Building for Production

```bash
# Build the frontend
npm run build

# Preview the production build
npm run preview
```

## 📱 User Interface

### Design Philosophy
- **Minimalist**: Clean, uncluttered interface focusing on content
- **Dark Theme**: Gradient backgrounds with glassmorphism effects
- **Responsive**: Mobile-first design that works on all devices
- **Accessible**: High contrast, clear typography, keyboard navigation

### Layout Structure
- **Sidebar Navigation**: Easy access to all modules
- **Dashboard**: Central hub showing daily overview and quick stats
- **Module Pages**: Dedicated spaces for each feature area
- **Modal System**: Overlay forms for creating and editing content

## 🔐 Security Features

- **JWT Authentication**: Secure token-based user sessions
- **Password Hashing**: bcryptjs for secure password storage
- **Route Protection**: Authenticated routes and middleware
- **Data Isolation**: User-specific data access controls
- **File Upload Security**: Validated file types and sizes

## 📊 Data Management

### Database Schema
The application uses SQLite for development with the following key tables:
- `users` - User accounts and authentication
- `journal_entries` - Daily journal entries and moods
- `workouts` - Exercise plans and tracking
- `meals` - Nutrition and meal tracking
- `books` - Personal library management
- `ideas` - Notes and idea capture
- `goals` - Daily tracking and habit data
- `events` - Calendar and scheduling
- `todos` - Task management

### API Endpoints
The REST API provides full CRUD operations for all data types:
- Authentication: `/login`, `/register`
- Journal: `/journal/*`
- Workouts: `/workouts/*`
- Meals: `/meals/*`
- Books: `/books/*`
- Ideas: `/ideas/*`
- Goals: `/goals/*`
- Events: `/events/*`
- Todos: `/todos/*`

## 🎨 Customization

### Theming
The app uses a sophisticated theming system built on Tailwind CSS:
- Gradient backgrounds (indigo → purple → pink)
- Glassmorphism effects with backdrop blur
- Consistent color palette for different content types
- Hover and focus states for interactive elements

### Icons and Visual Elements
- Lucide React provides 500+ consistent icons
- Custom gradient overlays for visual hierarchy
- Smooth animations and transitions
- Progress indicators and data visualizations

## 🔄 Development Workflow

### Code Structure
```
src/
├── components/          # React components
│   ├── Premium*.tsx    # Main application components
│   └── *.tsx          # Legacy/alternative components
├── contexts/           # React Context providers
├── utils/             # Utility functions and API helpers
├── pages/             # Route components
└── assets/            # Static assets
```

### Development Commands
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run lint       # Run ESLint
npm run preview    # Preview production build
```

## 🌐 API Integration

### External Services
- **Daily Wisdom**: Fetches stoic quotes from `/daily` endpoint
- **File Storage**: Local file system with `/uploads` directory
- **Data Export**: JSON format with comprehensive user data

### Rate Limiting & Performance
- Optimized database queries with proper indexing
- Image compression and optimization
- Lazy loading for better performance
- Client-side caching for frequently accessed data

## 🎯 Philosophy Integration

### Stoic Principles
The application incorporates core stoic philosophy concepts:
- **Self-Reflection**: Daily journaling and mood tracking
- **Goal Setting**: Focus on what you can control
- **Habit Formation**: Building virtue through consistent practice
- **Wisdom Cultivation**: Daily quotes and philosophical insights
- **Progress Tracking**: Measuring growth over time

### Mindful Design
- Encourages thoughtful interaction over mindless scrolling
- Promotes intentional goal setting and habit formation
- Provides space for reflection and contemplation
- Balances digital tools with philosophical wisdom

## 🔧 Troubleshooting

### Common Issues
1. **Server connection errors**: Ensure backend is running on port 5001
2. **Authentication issues**: Check JWT token validity and environment variables
3. **File upload problems**: Verify upload directory permissions
4. **Database errors**: Check SQLite file permissions and path

### Logging
The application includes comprehensive logging:
- Server requests and responses
- Authentication events
- Database operations
- Error tracking and debugging

## 🤝 Contributing

This is a personal development application. For feature requests or bug reports, please contact the development team.

## 📄 License

This project is private and proprietary. All rights reserved.

---

**Eudaimon by Zewo** - Bridging ancient wisdom with modern life management to achieve human flourishing.
