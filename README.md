# MORPHOS - Parametric CAD Powered by AI

MORPHOS is a professional-grade parametric CAD platform that leverages AI to generate 2D and 3D models from natural language descriptions and sketches. It is designed for engineers, makers, and CNC enthusiasts who want to bridge the gap between idea and physical part.

## ✨ Features

- **Dual Mode CAD**: Support for professional 3D parametric modeling (via Replicad) and precise 2D line drawings (via Makerjs).
- **AI-Driven Generation**: Describe your part in natural language or upload a sketch to generate working CAD code using Google Gemini.
- **CNC Ready**: Export designs in industry-standard formats including STL, STEP, SVG, DXF, and G-Code.
- **Parametric Power**: Models are defined by code, allowing for infinite adjustments and variations.
- **Modern Stack**: Built with SolidJS, Babylon.js, and Astro for maximum performance and a seamless user experience.

## 🚀 Tech Stack

- **Monorepo**: npm workspaces
- **Frontend App**: SolidJS + Babylon.js + Tailwind CSS
- **Landing Page**: Astro
- **CAD Engines**: Replicad (OpenCascade) & Makerjs
- **AI**: Google Gemini Pro (Generative AI)
- **Deployment**: Optimized for Cloudflare Pages

## 📦 Project Structure

```text
/
├── apps/
│   ├── app/         # The main CAD application (SolidJS)
│   └── landing/     # Marketing landing page (Astro)
├── node_modules/
├── package.json     # Root workspace configuration
└── README.md
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- A Google Gemini API Key

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables:
   Create a `.env` file in `apps/app/` with:
   ```text
   VITE_GEMINI_API_KEY=your_api_key_here
   ```

### Development

Run both the app and landing page in development mode:
```bash
npm run dev
```

Or run them individually:
```bash
npm run dev -w apps/app
npm run dev -w apps/landing
```

## ☁️ Deployment on Cloudflare

MORPHOS is optimized for deployment on **Cloudflare Pages**.

### 1. Manual Deployment via CLI

1. Build the projects:
   ```bash
   npm run build
   ```
2. Deploy the app:
   ```bash
   npx wrangler pages deploy apps/app/dist --project-name morphos-app
   ```
3. Deploy the landing page:
   ```bash
   npx wrangler pages deploy apps/landing/dist --project-name morphos-landing
   ```

### 2. Automated Deployment via Git

1. Connect your GitHub repository to Cloudflare Pages.
2. Create two separate Pages projects.
3. For the **App**:
   - Build command: `npm run build -w apps/app`
   - Build output directory: `apps/app/dist`
4. For the **Landing Page**:
   - Build command: `npm run build -w apps/landing`
   - Build output directory: `apps/landing/dist`

## 📄 License

MIT
