# MORPHOS

AI-powered 3D CAD modeling application with JSCAD code generation.

## Features

- 🤖 AI-powered 3D model generation using Gemini
- 🎨 Real-time 3D preview with Three.js
- 💬 Natural language interface (French/English)
- 📦 Multiple export formats (STL, OBJ, 3MF, G-code)
- 🎭 Material library with PBR rendering
- 🌓 Dark/Light theme support
- 📱 PWA installable

## Quick Start

```bash
# Install dependencies
npm install

# Development server (port 5174)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Configuration

Create a `.env` file:

```env
VITE_GEMINI_API_KEY=your_api_key_here
```

Get your Gemini API key from: https://makersuite.google.com/app/apikey

## Tech Stack

- React + TypeScript
- Three.js (3D rendering)
- JSCAD (CAD modeling)
- Gemini AI (code generation)
- Vite (build tool)
- Tailwind CSS (styling)

## Usage

1. Open the app at http://localhost:5174
2. Click the chat button
3. Describe your 3D model in natural language
4. View and export your generated model

## License

MIT
