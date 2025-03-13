# AI Image Generator Backend

This is the FastAPI backend for the AI Image Generator application. It provides endpoints for generating images using DALL-E 3, storing them in Cloudinary, and managing image metadata in Supabase.

## Features

- Image generation with DALL-E 3
- Prompt refinement with GPT-4
- Image storage in Cloudinary
- Image metadata storage in Supabase
- User image management
- Like/unlike functionality
- Explore page with pagination

## Setup

1. Create a virtual environment:
   ```
   python -m venv env
   ```

2. Activate the virtual environment:
   - Windows: `.\env\Scripts\activate`
   - macOS/Linux: `source env/bin/activate`

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Create a `.env` file based on `.env.example` and fill in your API keys:
   ```
   cp .env.example .env
   ```

5. Run the server:
   ```
   uvicorn main:app --reload
   ```

## API Endpoints

- `POST /images/generate`: Generate an image based on a prompt
- `GET /images/user`: Get all images for the current user
- `GET /images/explore`: Get images for the explore page with pagination
- `POST /images/like`: Like an image
- `POST /images/unlike`: Unlike an image
- `DELETE /images/{image_id}`: Delete an image

## Database Schema

### Images Table
- id (UUID, primary key)
- user_id (string, foreign key)
- image_url (string)
- prompt (string)
- refined_prompt (string, nullable)
- created_at (timestamp)
- likes (integer)

### Likes Table
- id (UUID, primary key)
- image_id (UUID, foreign key)
- user_id (string, foreign key)
- created_at (timestamp) 