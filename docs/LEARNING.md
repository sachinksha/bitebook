# BiteBook Learning Guide

This guide uses the BiteBook project to teach modern web development concepts with React, JavaScript, and Firebase.

## 1. What this app does

BiteBook is a meal logging app with the following capabilities:
- Log daily meals for breakfast, lunch, and dinner
- Track whether meals are home-cooked, ordered, or skipped
- Persist data in Firebase Firestore per authenticated user
- Authenticate users using Google OAuth via Firebase Auth
- View history, calendar, and insights about meal patterns
- Import and export data through Excel files

## 2. Core web development concepts

### Single-Page Application (SPA)
The app is a SPA built with React. A SPA loads once and updates the UI dynamically in the browser without full page reloads.

Why it matters:
- Better user experience
- Faster interaction
- State stays in memory between view changes

Learn more:
- https://react.dev/learn
- https://javascript.info/intro

### React components
The app is composed of reusable components:
- `App.jsx` is the root component
- `Header.jsx`, `LogView.jsx`, `HistoryView.jsx`, `InsightsView.jsx`, `DataView.jsx`
- Presentational and stateful components are separated for clarity

Components are built with JSX, a syntax that mixes JavaScript and HTML-like markup.

### React hooks
React hooks are the main way this app manages behavior and state:
- `useState` holds local component state
- `useEffect` runs side effects, such as fetching data
- `useMemo` computes derived values efficiently
- `useCallback` memoizes callback functions

Important rules:
- Only call hooks at the top level of a React function component
- Don’t call hooks inside loops, conditionals, or nested functions

### React Context
The app uses React Context to share state and behavior across components:
- `AppContext` provides meal data and actions like `saveMeal`
- `ToastContext` provides the toast notification API
- `MealContext` stores transient UI state for the meal entry form
- `AuthContext` provides authentication state and methods

Context helps avoid "prop drilling" by making values available to many nested components.

### Firebase integration
Firebase is used for backend services without building a custom server:
- `firebase/auth` authenticates users with Google
- `firebase/firestore` stores meal entries in the cloud

This app uses Firestore to store user-specific meal documents and secure them with Firebase rules.

### Modern JavaScript
The codebase uses modern JavaScript (ES2020+):
- modules with `import` / `export`
- arrow functions: `() => {}`
- async/await for asynchronous code
- destructuring: `const { user } = useAuth()`
- optional chaining and default values
- template literals: `` `Hello ${name}` ``

## 3. Architecture overview

### Data flow
1. User logs in with Google
2. `useFoodData` fetches meals from Firestore for that user
3. Components read meal data through `AppContext`
4. User actions call functions like `saveMeal` and `updateEntry`
5. These functions update Firestore and local React state

This is a common pattern for modern web apps: local state mirrors remote state.

### File structure
- `src/main.jsx` mounts the React app
- `src/App.jsx` composes providers and views
- `src/context/` contains shared context providers
- `src/hooks/` contains reusable logic hooks
- `src/components/` contains UI components
- `src/utils/` contains utility helpers

## 4. Important files explained

### `src/main.jsx`
This is the app entry point. It initializes React and wraps the app in `AuthProvider`.

### `src/App.jsx`
This file:
- reads auth state from `useAuth`
- protects the app behind login
- provides contexts for the rest of the app
- renders the main views based on the selected tab

### `src/context/AuthProvider.jsx`
This file sets up Firebase Auth and exposes:
- `user` object
- `loading` state
- `login()` and `logout()` functions

### `src/hooks/useFoodData.js`
This hook manages meal data and Firestore interactions:
- fetches user meals on login
- saves, updates, deletes, and replaces meal documents
- computes suggestions and streaks with `useMemo`

### `src/hooks/useMealContext.js`
This hook stores small UI state in `sessionStorage` so user selections persist during a browser session.

### `src/utils/persistence.js`
This utility originally handled browser local storage and now safely falls back if storage is unavailable.

## 5. Deployment and hosting

The app uses Vite for development and build tooling.
- `npm run dev`: start live development server
- `npm run build`: create production bundle
- `npm run preview`: preview built output

The project is also deployed on Vercel, which is well-suited for React apps and static hosting.

## 6. Learning resources referenced by this project

- React fundamentals: https://react.dev
- JavaScript language basics: https://javascript.info
- Firebase docs: https://firebase.google.com/docs
- Vite docs: https://vitejs.dev

## 7. What to learn next

If you want to go deeper, study:
- component composition and hooks patterns
- React Router for page-level navigation
- form validation and controlled components
- offline-first apps and service workers
- backend APIs and serverless functions
- testing with React Testing Library and Jest
