# 📝 TodoList App

## Features

- Create, read, update, and delete todos
- Biometric authentication (Face ID / Touch ID / Fingerprint)
- Persistent local storage with AsyncStorage
- Modern, responsive UI with dark mode support
- Cross-platform (iOS & Android)

## Tech Stack

### Core

- **React Native** (0.81.5) - Mobile framework
- **React** (19.1.0) - UI library
- **TypeScript** (5.8.3) - Type safety and better DX
- **Expo** (~54.0.0) - Development tools and native APIs

### State Management

- **React Context API** - Global state management
- **useReducer Hook** - Predictable state updates

### Storage & Authentication

- **@react-native-async-storage/async-storage** (^2.2.0) - Persistent data storage
- **expo-local-authentication** (~17.0.8) - Biometric authentication

### UI & Layout

- **react-native-safe-area-context** (^5.5.2) - Safe area handling
- Custom components with responsive design

### Testing

- **Jest** (^29.6.3) - Testing framework
- **React Test Renderer** (19.1.0) - Component testing
- **@types/jest** - TypeScript support for tests

## Folder Structure

```
TodoList/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/          # Generic components (Button, Input, etc.)
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── index.ts
│   │   ├── TodoForm/        # Todo creation/edit form
│   │   │   └── index.tsx
│   │   └── TodoItem/        # Individual todo component
│   │       └── index.tsx
│   │
│   ├── screens/             # Screen components
│   │   └── TodoListScreen.tsx
│   │
│   ├── contexts/            # React Context for state management
│   │   ├── TodoContext.tsx  # Todo state & actions
│   │   └── index.ts
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.ts       # Authentication hook
│   │   ├── useTodos.ts      # Todo management hook
│   │   └── index.ts
│   │
│   ├── services/            # Business logic & external APIs
│   │   ├── storageService.ts    # AsyncStorage wrapper
│   │   ├── biometricService.ts  # Biometric auth wrapper
│   │   └── index.ts
│   │
│   ├── types/               # TypeScript type definitions
│   │   ├── todo.types.ts    # Todo-related types
│   │   ├── auth.types.ts    # Auth-related types
│   │   └── index.ts
│   │
│   ├── utils/               # Utility functions
│   │   ├── formatDate.ts    # Date formatting
│   │   ├── responsive.ts    # Responsive helpers
│   │   └── index.ts
│   │
│   ├── constants/           # App-wide constants
│   │   └── colors.ts        # Color palette
│   │
│   └── __tests__/           # Unit tests
│       ├── storageService.test.ts
│       ├── biometricService.test.ts
│       └── todoReducer.test.ts
│
├── __tests__/               # Integration tests
│   └── App.test.tsx
```

## Getting Started

### Prerequisites

- **Node.js** >= 20
- **npm** or **yarn**
- **iOS Simulator** (Mac only) / **Android Emulator** or physical device
- **Xcode** (for iOS development)
- **Android Studio** (for Android development)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd TodoList
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **For iOS (Mac only):**
   ```bash
   cd ios && pod install && cd ..
   ```

### Running the App

**iOS:**
```bash
npm run ios
```

**Android:**
```bash
npm run android
```

**Start Metro bundler:**
```bash
npm start
```
## Testing

### Running Tests

**Run all tests:**
```bash
npm test
```

**Run tests with coverage:**
```bash
npm test -- --coverage
```

**Run specific test file:**
```bash
npm test -- App.test.tsx
```