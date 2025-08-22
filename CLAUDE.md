# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm install` - Install dependencies
- `npm run dev` - Start development server (Vite, runs on port 3000)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Testing
No test commands are currently configured in this project.

## Architecture Overview

### Project Type
React + Vite application for an SD (Stable Diffusion) character gallery with music integration. This is an MVP/demo application that displays character cards with associated music tracks.

### Key Architecture Patterns

**Data Layer:**
- Currently uses mock data services (`src/utils/mockData.js`) for development
- Designed to integrate with Supabase backend (configured in `src/utils/supabase.js`)
- Database schema defined in `database/database-schema.sql`

**Component Structure:**
- `App.jsx` - Main application with tab navigation (music/no-music characters)
- `CharacterCard.jsx` - Displays individual character with image, music controls, and metadata
- Component hierarchy: App → CharacterGrid → CharacterCard

**State Management:**
- React state for character data, audio playback, and UI state
- Audio management handled at App level with refs for cleanup
- No external state management library used

**Music Integration:**
- Audio playback using HTML5 Audio API
- Support for multiple platforms (Suno, YouTube, SoundCloud)
- Play/pause controls with mute functionality

### Database Design
The application is designed around these main entities:
- **Characters** - Core content with metadata and approval status
- **Assets** - Images/media files with prompt information  
- **Music** - Associated audio tracks with platform integration
- **Tags** - Categorization system for characters
- **Users** - Creator information and permissions
- **Engagement** - Analytics and interaction tracking

### File Import Patterns
- Components import from relative paths (`./components/`)
- Utilities import from `./lib/` or `./utils/`
- Mock data services are imported and re-exported through supabase.js
- CSS imports use relative paths to `src/styles/`

### UI/UX Patterns
- Tab-based navigation between character types
- Card grid layout with responsive breakpoints
- Hover states reveal music controls and download buttons
- Loading skeletons for better UX
- Japanese language UI for target audience

### Development Notes
- Images are handled through asset URLs with thumbnail support
- Audio playback includes error handling and cleanup
- Component props follow clear naming conventions (character, hasMusic, etc.)
- Event handlers use descriptive names (handlePlay, handleDownload)