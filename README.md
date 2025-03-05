# Google Photos Unofficial Viewer

A simple web application that allows users to view their Google Photos library. This project consists of a React frontend and an Express backend that handles Google OAuth authentication.

## Features

- Google OAuth authentication
- View photos from your Google Photos library
- Responsive design

## Project Structure

The project is divided into two main parts:

- `client`: React frontend built with Vite
- `server`: Express backend with TypeScript

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Google Cloud Platform account with Google Photos API enabled

## Setup

### Google Cloud Platform Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable the Google Photos Library API
4. Create OAuth 2.0 credentials
   - Set the authorized redirect URI to `http://localhost:3001/auth/google/callback`
   - Note your Client ID and Client Secret

### Server Setup

1. Navigate to the server directory:
   ```
   cd server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```
   PORT=3001
   CLIENT_URL=http://localhost:5173
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback
   ```

4. Build and start the server:
   ```
   npm run build
   npm start
   ```

   For development:
   ```
   npm run dev
   ```

### Client Setup

1. Navigate to the client directory:
   ```
   cd client
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

## Usage

1. Open your browser and navigate to `http://localhost:5173`
2. Click on "Login with Google"
3. Authorize the application to access your Google Photos
4. View your photos in the gallery

## License

This project is licensed under the ISC License. 