# Photos Unofficial Viewer

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

3. Create a `.env` file based on `.env.example`:
   ```
   VITE_API_URL=http://localhost:3001
   ```

4. Start the development server:
   ```
   npm run dev
   ```

## Deployment

### Environment Variables

#### Client Environment Variables

For production deployment, create a `.env.production` file in the client directory with:

```
VITE_API_URL=https://your-production-api-url.com
```

Replace `https://your-production-api-url.com` with your actual production API URL.

#### Server Environment Variables

For production deployment, make sure to set these environment variables:

```
PORT=3001 (or your preferred port)
CLIENT_URL=https://your-production-client-url.com
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=https://your-production-api-url.com/auth/google/callback
MONGODB_URI=your_mongodb_atlas_connection_string
SESSION_SECRET=your_secure_session_secret
```

### Building for Production

#### Client

```
cd client
npm run build
```

This will create a `dist` directory with optimized production files.

#### Server

```
cd server
npm run build
```

This will compile TypeScript to JavaScript in the `dist` directory.

## Usage

1. Open your browser and navigate to `http://localhost:5173`
2. Click on "Login with Google"
3. Authorize the application to access your Google Photos
4. View your photos in the gallery

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.