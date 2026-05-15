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

## 7. Information Architecture & Responsive Design

Responsive design ensures web apps work well on phones, tablets, and desktops. BiteBook demonstrates modern patterns for fitting rich information on screens of all sizes.

### Card-based layouts for mobile
Instead of large data tables that require horizontal scrolling on phones, BiteBook uses **card-based layouts**:
- Each piece of information (meal entry, calendar day) becomes a discrete, vertically-stacking card
- Cards have generous padding and touch-friendly tap targets (44px minimum height)
- Visual hierarchy guides the eye: meal type → dish name → details → actions

**Calendar View example:**
- Old: 14-day table with 4 columns (horizontal scroll on mobile)
- New: 7-day card grid showing date + meal icons + prep info
- Mobile: 1 column (full width cards)
- Tablet: 2 columns (side-by-side)
- Desktop: 3 columns (compact view)

**History View example:**
- Old: 8-column table with all details visible (overwhelming on phones)
- New: Collapsible entry cards grouped by date
  - Summary row: meal icon + name + type badge + dish
  - Click to expand: show preparedBy, made-by, order type
  - Action buttons: edit, delete
- Mobile: Single-column stacked cards with large touch targets
- Desktop: Same layout (no multi-column squeeze)

### CSS Grid for responsive layouts
CSS Grid is powerful for responsive layouts without media queries on every element:

```css
.calendar-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: 1fr;
}

@media (min-width: 640px) {
  .calendar-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .calendar-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

This single breakpoint rule handles responsive layout for all children. Compare to flexbox, which often needs more media queries.

### Information hierarchy & progressive disclosure
Too much information overwhelms users. BiteBook uses **progressive disclosure** (show summary, hide details):
- History entries show only: meal icon + name + badge + dish
- User clicks to expand and see: preparedBy, made-by type, order type
- All edit/delete actions in the expanded section

This pattern scales to phones without overwhelming the screen.

### Touch-friendly UI
Phones use touch, not mouse. BiteBook applies touch-friendly principles:
- Minimum tap target: 44×44px (CSS `min-height: 44px`)
- Padding around interactive elements to avoid accidental taps
- No hover states on mobile (touch devices don't hover)
- Clear, large icons (meal emojis: 🌅 ☀️ 🌙)

### Learning from Amazon mobile design
Amazon's mobile app demonstrates how to fit large amounts of information on small screens:
1. **Information density**: Show key data (price, rating) at a glance; hide details behind layers
2. **Card-based layout**: Each product is a card with image, title, price, rating
3. **Scroll, don't horizontally swipe**: Mobile is vertical; horizontal scroll is confusing
4. **Progressive disclosure**: Click cards to expand details; modals for complex interactions
5. **Consistent spacing**: Generous gaps between cards make touch targets clear

BiteBook applies these patterns:
- Cards stack vertically (no horizontal scroll)
- Key info (date, meal type) visible on first glance
- Details revealed on tap
- Consistent spacing with CSS Grid gap

### Responsive design best practices
1. **Mobile first**: Start with mobile layout (1 column), then add media queries for larger screens
2. **Breakpoints**: Use standard breakpoints (640px tablet, 1024px desktop)
3. **Viewport meta tag**: Ensure `<meta name="viewport" content="width=device-width, initial-scale=1">`
4. **Flexible images**: Use `max-width: 100%` to prevent overflow
5. **Test on real devices**: Emulator sizes don't match real phone behavior

### Performance & accessibility
Responsive design also improves performance:
- Simpler layouts = fewer CSS calculations
- Vertical scrolling is faster than horizontal layout shifts
- Fewer media queries = faster style recalculation

Accessibility also benefits:
- Large touch targets help users with motor control challenges
- Clear visual hierarchy helps users understand content structure
- Grouped information (by date) helps users navigate complex data

## 8. What to learn next

If you want to go deeper, study:
- component composition and hooks patterns
- React Router for page-level navigation
- form validation and controlled components
- offline-first apps and service workers
- backend APIs and serverless functions
- testing with React Testing Library and Jest
- CSS Grid and Flexbox layout deep dive
- web performance optimization
- accessibility standards (WCAG 2.1)
