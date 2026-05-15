# 🥗 BiteBook

BiteBook is a modern React web application for tracking daily meals. It demonstrates modern web development best practices with React, Firebase, and Vite while providing real, user-facing functionality.

## Project overview

BiteBook allows users to:
- Log breakfast, lunch, and dinner entries
- Mark meals as home-cooked, ordered, or skipped
- Store and retrieve data securely per user via Firebase
- View meal history, calendar analytics, and insights
- Import and export data using Excel files
- Login with Google using Firebase Authentication

## Why this project is educational

This repo is designed to teach several important web development concepts:
- React component architecture and hooks
- Context-based state sharing
- Cloud backend integration using Firebase Auth and Firestore
- Build tooling with Vite
- Error handling and mobile-safe storage fallbacks
- Deployment on Vercel

## Live demo

The app is deployed at:
- https://bitebook-six.vercel.app/

## Feature summary

### Meal logging
- Log meal descriptions with meal type, status, and preparation details
- Support home cooking, restaurant orders, and skipped meals
- Add order details for outside food (dine-in or delivery)
- Quickly reuse previous meal entries with drag-and-drop suggestions

### Data management
- Export meal history to an Excel file
- Import meal data from Excel using a template structure
- Replace all existing data with imported rows
- Clear your meal logs entirely for the signed-in user

### Insights and visualizations
- See a calendar view of recent meal activity
- View history with edit and delete options
- Analyze top dishes and meal patterns
- Track who cooks most often and how frequently items are repeated

## Technology stack

- **React 19** — component-driven UI
- **Vite** — fast dev server and build tool
- **Firebase Auth** — Google login and authentication
- **Firebase Firestore** — cloud database for meal storage
- **Chart.js** — data visualization
- **XLSX** — Excel import/export
- **Vercel** — deployment platform

## File structure

Important files and folders:
- `src/main.jsx` — entry point, mounts the React app, wraps it in `AuthProvider`
- `src/App.jsx` — root app component, user gating, view rendering
- `src/context/` — shared React contexts and authentication provider
- `src/hooks/` — custom hook logic for data and UI state
- `src/components/` — UI building blocks and page views
- `src/utils/` — helper functions for persistence and formatting
- `src/firebase.js` — Firebase project initialization
- `docs/LEARNING.md` — in-depth documentation and learning guide

## Setup and running locally

Install dependencies:
```bash
npm install
```

Run the development server:
```bash
npm run dev
```

Build the production bundle:
```bash
npm run build
```

Preview the production build locally:
```bash
npm run preview
```

## Firebase setup

To run the app with Firebase locally:
1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Google authentication in `Authentication` -> `Sign-in method`
3. Create a Firestore database in your Firebase project
4. Add your Vercel or local domain under `Authentication` -> `Authorized domains`
5. Update `src/firebase.js` with your Firebase config values

Example `src/firebase.js` config:
```js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

### Firestore security rules

Use these rules to ensure users only access their own meals:
```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /meals/{meal} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

## Deployment

This app is ready for Vercel deployment and currently lives at:
- https://bitebook-six.vercel.app/

The Vercel deployment uses the `main` branch and automatically rebuilds when updated.

## Learning resources

This repo is not just an app — it is also a learning resource.
- React docs: https://react.dev/
- JavaScript guide: https://javascript.info/
- Firebase docs: https://firebase.google.com/docs
- Vite docs: https://vitejs.dev/

## Learn from this project

For a deeper explanation of the app architecture and concepts used here, read:
- [docs/LEARNING.md](docs/LEARNING.md)

## Useful commands

### Local development
```bash
npm run dev
```

### Production build
```bash
npm run build
```

### Preview production build
```bash
npm run preview
```

### Serve built app locally
```bash
npx serve dist 3000
```

## Notes

- Google login is required to use the app
- Meal data is saved per user in Firebase Firestore
- The app is built with modern React hooks and context
- Storage fallbacks are included for browsers that restrict session/local storage

## Contributing ideas

If you want to extend this project, possible improvements include:
- adding offline caching
- using React Router for deeper navigation
- adding user settings/profile pages
- using server-side rendering or serverless functions
- improving import validation and error handling
