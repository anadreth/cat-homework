# Dashboard Builder

 Build customizable, interactive dashboards with drag-and-drop widgets, real-time editing, secure authentication, and multi-format exports.

![React](https://img.shields.io/badge/React-19-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue) ![Redux](https://img.shields.io/badge/Redux-Toolkit-purple) ![Express](https://img.shields.io/badge/Express-4.x-green) ![Auth0](https://img.shields.io/badge/Auth0-OAuth2-orange) ![License](https://img.shields.io/badge/license-MIT-green)

---

## Overview

Dashboard Builder is a comprehensive web application that enables users to create, customize, and share interactive dashboards through an intuitive drag-and-drop interface. The project combines a modern React frontend with a Express backend.

### Key Highlights

- **Intuitive Interface** - Drag widgets from a palette onto a responsive grid canvas
- **Real-time Editing** - Edit widget properties with instant visual feedback
- **Secure Authentication** - OAuth2 + PKCE flow with Auth0 integration
- **Multi-format Export** - Save dashboards as JSON, export widgets as PNG/PDF/CSV/XLSX

---

## Architecture

### System Overview

**Client (React 19)**
- **Palette** - Widget library sidebar
- **Canvas** - Gridstack grid for dashboard layout
- **Inspector** - Property editor panel (react-hook-form)
- **Redux Store** (Redux Toolkit + redux-undo)
  - coreSlice (widgets, layout, undo/redo)
  - selectionSlice (selected widget)
  - uiSlice (panels, save status)
  - authSlice (user profile, auth state)

**Communication Layer**
- HTTPS requests via Axios
- HttpOnly cookies for tokens

**Server (Express + TypeScript)**
- **Auth0 OAuth2 + PKCE Flow**
  - `/auth/login` - Generate PKCE challenge
  - `/auth/callback` - Exchange code for tokens
  - `/auth/profile` - Get user info
  - `/auth/logout` - Clear session
  - `/auth/refresh` - Refresh access token
- **HttpOnly Cookies** - Secure token storage (access_token, refresh_token)
- **Middleware** - CORS, Cookie Parser, Error Handling

### Tech Stack

#### Frontend (`/client`)
| Technology | Purpose |
|------------|---------|
| **React** | UI framework with React Compiler for automatic optimizations |
| **TypeScript** | Type safety and enhanced developer experience |
| **Redux Toolkit** | Centralized state management with slices |
| **redux-undo** | Time-travel debugging, undo/redo functionality |
| **React Router** | Client-side routing and navigation |
| **Gridstack.js** | Drag-and-drop grid system with resize support |
| **Tremor** | Beautiful, accessible UI components |
| **react-hook-form** | Performant form state management |
| **Zod** | Runtime schema validation for imports |
| **Tailwind CSS** | Utility-first styling framework |
| **Recharts** | Composable charting library |
| **Vitest** | Fast unit testing framework |
| **Vite** | Next-generation build tool and dev server |

#### Backend (`/server`)
| Technology | Purpose |
|------------|---------|
| **Express** | Web application framework |
| **TypeScript** | Type-safe server-side code |
| **Auth0** | Identity provider (OAuth2 + PKCE) |
| **Axios** | HTTP client for Auth0 API calls |
| **cookie-parser** | Parse and manage HttpOnly cookies |
| **CORS** | Cross-origin resource sharing middleware |

---

## Features

### Dashboard Building

#### Widget System
- **Chart Widget** - Area charts with customizable data, colors, and axes
- **Table Widget** - Sortable data tables with customizable columns
- **List Widget** - Vertical lists with custom items and styling
- **Text Widget** - Rich text content blocks with formatting

#### Canvas Interaction
- **Drag & Drop** - Drag widgets from palette onto canvas
- **Resize** - Click and drag widget edges to resize
- **Move** - Drag widget headers to reposition
- **Grid Snapping** - 12-column responsive grid with 60px cell height
- **Auto-layout** - Automatic collision detection and layout optimization

#### Property Editing
- **Inspector Panel** - Right-side panel for editing selected widget properties
- **Schema-driven Forms** - Forms generated from widget editor schemas
- **Real-time Updates** - Changes reflected instantly on canvas
- **Type Validation** - Form validation with react-hook-form + Zod

### State Management

#### Undo/Redo System
- **100-step History** - Track up to 100 widget changes
- **Toolbar Buttons** - Desktop toolbar with undo/redo buttons
- **Granular Tracking** - Each action (add, delete, move, edit) creates history entry

#### Auto-save
- **Debounced Persistence** - Save to LocalStorage after 700ms of inactivity
- **Save Status Indicator** - Visual feedback (Saving... / Saved / Error)
- **Automatic Recovery** - Restore dashboard on page reload

### Export & Import

#### Dashboard Export
- **Full Dashboard JSON** - Export entire dashboard with all widgets and layout
- **Versioned Format** - Schema version for future migrations
- **Metadata Included** - Created/updated timestamps, dashboard name

#### Widget Export
- **JSON Template** - Export individual widget as reusable template
- **Visual Exports**:
  - **PNG** - Screenshot of widget using html2canvas
  - **PDF** - Vector document export with jsPDF
  - **CSV** - Table data export (tables only)
  - **XLSX** - Excel spreadsheet export (tables only)

#### Import
- **Dashboard Import** - Restore full dashboard from JSON file
- **Widget Import** - Add individual widget templates to canvas
- **ID Regeneration** - Prevent conflicts when importing widgets
- **Schema Validation** - Validate imports with Zod before applying

### Authentication

#### OAuth2 + PKCE Flow
- **Auth0 Integration** - Enterprise-grade identity provider
- **PKCE Security** - Proof Key for Code Exchange
- **HttpOnly Cookies** - Tokens stored securely in cookies (not accessible via JS)
- **Automatic Refresh** - Silent token refresh before expiration
- **Session Restoration** - Auto-login on page reload if session valid

#### Testing
- **129 Passing Tests** - Comprehensive test suite with Vitest
- **Test Coverage**:
  - Redux slices (state management)
  - Widget management (add, edit, delete)
  - Undo/Redo functionality
  - Export/Import workflows
  - Autosave functionality
- **Test Utilities** - Custom render helpers for Redux-wrapped components

---

## Getting Started

### Prerequisites

- **Node.js 18+** (LTS recommended)
- **npm** or **yarn**
- **Auth0 Account** (free tier available)

### Installation

#### 1. Clone Repository

```bash
git clone <repository-url>
cd cat-homework
```

#### 2. Setup Client

```bash
cd client
npm install
```

#### 3. Setup Server

```bash
cd ../server
npm install
```

#### 4. Configure Auth0

1. Create Auth0 account at [auth0.com](https://auth0.com)
2. Create a new **Single Page Application**
3. Configure Application Settings:
   - **Allowed Callback URLs**: `http://localhost:3000/auth/callback`
   - **Allowed Logout URLs**: `http://localhost:5173`
   - **Allowed Web Origins**: `http://localhost:5173`
   - **Allowed Origins (CORS)**: `http://localhost:5173`

4. Copy credentials from Auth0 Dashboard

#### 5. Configure Environment Variables

Create `/server/.env`:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Auth0 Configuration
AUTH0_DOMAIN=your-tenant.eu.auth0.com
AUTH0_CLIENT_ID=your_client_id_here

# Application URLs
APP_URL_DEV=http://localhost:5173
COOKIE_DOMAIN_DEV=localhost
```

### Running the Application

#### Development Mode

**Terminal 1 - Start Server:**
```bash
cd server
npm run dev
```
Server runs on `http://localhost:3000`

**Terminal 2 - Start Client:**
```bash
cd client
npm run dev
```
Client runs on `http://localhost:5173`

#### Access Application

1. Navigate to `http://localhost:5173`
2. Click **"Sign In"** or **"Go to Dashboard"**
3. Authenticate via Auth0 (showcase - optional)
4. Build your dashboard!

### Testing

```bash
# Run all tests
cd client
npm test

# Run tests in watch mode
npm run test

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage

# Type checking only
npm run build
```
---

## Project Structure

```
cat-homework/
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── Canvas/         # Gridstack grid canvas
│   │   │   ├── Palette/        # Widget sidebar
│   │   │   ├── Inspector/      # Property editor panel
│   │   │   ├── DashboardHeader/# Top navigation bar
│   │   │   ├── CanvasToolbar/  # Action buttons toolbar
│   │   │   ├── MobileMenu/     # Mobile navigation menu
│   │   │   ├── Modal/          # Generic modal component
│   │   │   ├── AddWidgetDialog/# Widget selection dialog
│   │   │   ├── ExportImport/   # Export/import functionality
│   │   │   ├── ProtectedRoute/ # Auth route guard
│   │   │   ├── WidgetWrapper/  # Widget container with toolbar
│   │   │   └── [WidgetType]/   # Individual widget components
│   │   ├── pages/              # Page components
│   │   │   ├── DashboardPage/  # Main dashboard page
│   │   │   └── HomePage/       # Landing page
│   │   ├── store/              # Redux store
│   │   │   ├── index.ts        # Store configuration
│   │   │   ├── slices/         # State slices
│   │   │   │   ├── coreSlice.ts      # Widgets & layout (with undo)
│   │   │   │   ├── selectionSlice.ts # Selected widget
│   │   │   │   ├── uiSlice.ts        # UI state (panels, save)
│   │   │   │   └── authSlice.ts      # Auth state & user
│   │   │   └── middleware/     # Custom middleware
│   │   │       ├── autosave.ts       # Debounced persistence
│   │   │       └── authListener.ts   # Auth sync
│   │   ├── constants/          # Constants & registries
│   │   │   ├── widget-registry.ts    # Widget definitions
│   │   │   └── grid.ts               # Grid configuration
│   │   ├── utils/              # Utility functions
│   │   │   └── apiClient.ts    # Axios instance with interceptors
│   │   ├── tests/              # Test suites
│   │   │   ├── redux-slices/   # Redux tests
│   │   │   ├── widget-management/
│   │   │   ├── undo-redo/
│   │   │   ├── import-export/
│   │   │   └── autosave/
│   │   ├── App.tsx             # Root component
│   │   └── main.tsx            # Entry point
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts            # Architecture guidelines
│
├── server/                     # Express backend
│   ├── src/
│   │   ├── config/             # Configuration
│   │   │   └── auth0.ts        # Auth0 credentials
│   │   ├── routes/             # API routes
│   │   │   └── auth.ts         # Auth endpoints
│   │   ├── middleware/         # Express middleware
│   │   │   ├── errorHandler.ts # Global error handler
│   │   │   └── validateAuth.ts # Token validation
│   │   ├── types/              # TypeScript types
│   │   │   └── index.ts        # Shared types
│   │   ├── utils/              # Utility functions
│   │   │   └── pkce.ts         # PKCE helpers
│   │   └── index.ts            # Express app entry
│   ├── dist/                   # Compiled JS (build output)
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example            # Environment template
│
├── docs/                       # Documentation
│   └── STEP-BY-STEP.md         # Development roadmap
│
└── README.md                   # This file
```

---

## Usage Guide

### Desktop Workflow

1. **Sign In** - Click "Sign In" then authenticate with Auth0
2. **Add Widgets** - Drag widget from left palette onto canvas
3. **Position** - Drag widget header to move, drag edges to resize
4. **Edit Properties** - Click widget then edit in right Inspector panel
5. **Delete** - Click delete icon (x) in widget header
6. **Undo/Redo** - Use toolbar buttons
7. **Export** - Click Export dropdown then select format
8. **Import** - Click Import then choose JSON file
9. **Auto-save** - Dashboard saves automatically to LocalStorage
10. **Logout** - Click user avatar then Logout

---

## Configuration

### Grid Settings

Edit `client/src/constants/grid.ts`:

```typescript
export const GRID_COLUMNS = 12;      // 12-column grid
export const CELL_HEIGHT = 60;       // Height per row (px)
export const VERTICAL_MARGIN = 10;   // Gap between widgets (px)
```

### Autosave Configuration

Edit `client/src/store/middleware/autosave.ts`:

```typescript
const STORAGE_KEY = "cat-dashboard";
const DEBOUNCE_MS = 700;  // Wait 700ms before saving
```

### Undo/Redo History Limit

Edit `client/src/store/index.ts`:

```typescript
const undoableCore = undoable(coreSlice.reducer, {
  limit: 100  // Maximum undo steps
});
```

### Server Port

Edit `server/.env`:

```env
PORT=3000  # Change server port
```

---

## API Documentation

### Authentication Endpoints

#### `GET /auth/callback`
Handles Auth0 callback after successful login

**Query Parameters:**
- `code` - Authorization code from Auth0
- `state` - CSRF protection token

**Response:**
- Sets `access_token` and `refresh_token` cookies
- Redirects to `/dashboard`

---

#### `GET /auth/me`
Fetches authenticated user profile

**Headers:**
- `Cookie: access_token=<token>`

**Response:**
```json
{
  "sub": "auth0|123456",
  "name": "John Doe",
  "email": "john@example.com",
  "picture": "https://..."
}
```

---

#### `POST /auth/logout`
Logs out user and clears cookies

**Response:**
- Clears `access_token` and `refresh_token` cookies
- Returns `{ success: true }`

---

#### `POST /auth/refresh`
Refreshes access token using refresh token

**Headers:**
- `Cookie: refresh_token=<token>`

**Response:**
- Sets new `access_token` cookie
- Returns `{ success: true }`

---

## Troubleshooting

### Authentication Issues

**Problem:** "Unauthorized" after login
- **Solution:** Check Auth0 credentials in `server/.env`
- **Solution:** Verify Auth0 callback URL matches `http://localhost:3000/auth/callback`
- **Solution:** Clear browser cookies and try again

**Problem:** Redirect loop after login
- **Solution:** Check `APP_URL_DEV` in `.env` matches client URL
- **Solution:** Verify CORS settings in Auth0 dashboard

### Widget Issues

**Problem:** Widgets not dragging
- **Solution:** Check browser console for Gridstack errors
- **Solution:** Verify `.palette-item` class on draggable elements

**Problem:** Widget properties not saving
- **Solution:** Check Redux DevTools for action dispatches
- **Solution:** Verify autosave middleware is running
- **Solution:** Check LocalStorage quota (max 5-10MB)

### Export/Import Issues

**Problem:** Import fails with validation error
- **Solution:** Ensure JSON matches schema version (current: `1.0.0`)
- **Solution:** Check browser console for detailed Zod errors
- **Solution:** Verify JSON is properly formatted (no trailing commas)

**Problem:** PNG/PDF export is blank
- **Solution:** Wait for widget to fully render before exporting
- **Solution:** Check for CORS issues with external images
- **Solution:** Try exporting a different widget type

### Performance Issues

**Problem:** Dashboard feels slow with many widgets
- **Solution:** Limit widgets on canvas (<50 recommended)
- **Solution:** Check React DevTools Profiler for excessive renders
- **Solution:** Clear undo/redo history (export then clear then import)
