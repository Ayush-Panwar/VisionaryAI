# VisionaryAI - AI Image Generation Platform

VisionaryAI is a powerful platform that allows users to generate, save, and share AI-created images. Built with Next.js for the frontend and FastAPI for the backend, this application offers a seamless experience for AI image creation.

## Features

- 🎨 **AI Image Generation**: Create stunning images using advanced AI models
- 🖼️ **Personal Gallery**: Save and organize your creations
- 🌐 **Community Exploration**: Browse and interact with images created by other users
- 💬 **Comments System**: Engage with other creators through comments
- 👍 **Like System**: Show appreciation for creative works
- 🔄 **Prompt Refinement**: Get assistance in crafting the perfect prompts
- 🌙 **Dark Mode**: Comfortable viewing experience day or night
- 📱 **Responsive Design**: Works great on desktop and mobile devices

## Technologies Used

- **Frontend**: Next.js 15, React 19, TailwindCSS, NextAuth.js
- **Backend**: FastAPI, PostgreSQL, Supabase
- **AI**: Integration with various AI image generation models
- **Cloud**: Cloudinary for image storage
- **Authentication**: Google OAuth

## Deployment Guide

Follow these steps to deploy VisionaryAI on Vercel:

### 1. Prerequisites

- A Vercel account
- A Supabase or other PostgreSQL database
- Google OAuth credentials
- Cloudinary account (for image storage)

### 2. Environment Variables Setup

Create the following environment variables in your Vercel project:

```
# Authentication
NEXTAUTH_SECRET=your-nextauth-secret-key
NEXTAUTH_URL=https://your-vercel-app-url.vercel.app

# Backend API
NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.com

# Google Authentication
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Database (if using Prisma)
DATABASE_URL=your-database-connection-string

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your-api-key
```

### 3. Deploy Frontend to Vercel

1. Connect your GitHub repository to Vercel
2. Configure the project with the following settings:
   - **Framework**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
3. Add all environment variables from step 2
4. Deploy the application

### 4. Deploy Backend

The backend can be deployed to various platforms:

#### Option 1: Deploy to a VPS (DigitalOcean, AWS, etc.)
1. SSH into your server
2. Clone the repository
3. Navigate to the backend directory
4. Install dependencies: `pip install -r requirements.txt`
5. Set up environment variables
6. Run the application with a production WSGI server:
   ```
   gunicorn main:app -k uvicorn.workers.UvicornWorker -w 4 --bind 0.0.0.0:8000
   ```

#### Option 2: Deploy to Render
1. Create a new Web Service in Render
2. Connect your GitHub repository
3. Set the build command: `pip install -r requirements.txt`
4. Set the start command: `gunicorn main:app -k uvicorn.workers.UvicornWorker -w 4 --bind 0.0.0.0:$PORT`
5. Add the environment variables
6. Deploy

#### Option 3: Deploy to Heroku
1. Create a new Heroku app
2. Connect your GitHub repository
3. Add the Python buildpack
4. Configure environment variables
5. Add a Procfile with: `web: gunicorn main:app -k uvicorn.workers.UvicornWorker -w 4`
6. Deploy

### 5. Update CORS Settings

Make sure to update the `allowed_origins` in your backend's CORS configuration with your Vercel domain.

### 6. Test the Deployment

Test all features in the deployed application to ensure everything is functioning correctly.

## Local Development

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local  # Then edit with your local values
npm run dev
```

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env  # Then edit with your local values
uvicorn main:app --reload
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 