# FocusForge

FocusForge is a productivity web application designed to help users maintain focus using the Pomodoro technique, track tasks, manage notes, and gamify their study/work sessions.

## Features

- **Global Pomodoro Timer**: Persists across page navigation. Modes for Focus, Short Break, Long Break.
- **Task Management**: Simple TODO list with progress tracking.
- **Gamification**: Earn XP, level up (Bronze to Master), and maintain streaks.
- **Analytics**: Visualize your productivity with Charts (using Recharts).
- **Notes**: A dedicated, auto-saving notes environment.
- **Weekly Review**: Reflection tool to track wins and improvements.
- **Leaderboard**: Compete against mock users based on a scoring algorithm.
- **Theme Support**: Fully functional Light and Dark modes.

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Recharts
- Context API + useReducer (State Management)
- LocalStorage (Persistence)

## How to Run

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Start Development Server**
    ```bash
    npm run dev
    ```

3.  Open the browser at the link provided by Vite (usually `http://localhost:5173`).

## Usage

- **Timer**: Click the Play button on the dashboard. Use the settings (gear icon) to change duration.
- **Tasks**: Add tasks in the dashboard.
- **Distractions**: Log them in the Analytics page.
- **Reset**: To reset all data, clear your browser's LocalStorage or open in Incognito.
