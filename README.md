# GeoTag Pro SaaS

A professional Geo Tagging SaaS platform built with Next.js and Node.js.

## Structure

- `client/`: Next.js frontend (Tailwind CSS, Framer Motion, Leaflet)
- `server/`: Express.js backend (Sharp, ExifTool, Multer)

## Getting Started

### 1. Prerequisites
- Node.js installed
- ExifTool installed (automatically handled by `exiftool-vendored` on most systems)

### 2. Running the Server
```bash
cd server
npm install
npm run dev
```
The server will run on `http://localhost:3001`.

### 3. Running the Client
```bash
cd client
npm install
npm run dev
```
The client will run on `http://localhost:3000`.

## Features
- ✨ Premium UI with Dark Mode & Glassmorphism
- 🗺️ Interactive Map Selector
- 📁 Drag & Drop Image Uploader
- 🏷️ GPS Metadata Injection (EXIF)
- 🚀 Bulk Processing Support
- 📱 Responsive Design
