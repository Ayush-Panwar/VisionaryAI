import os
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from datetime import datetime
import json
import requests
from dotenv import load_dotenv
from app.routers import images

# Load environment variables
load_dotenv()

app = FastAPI(title="AI Image Generator API")

# Configure CORS
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
vercel_url = os.getenv("VERCEL_URL", "")
allowed_origins = [
    frontend_url,
    f"https://{vercel_url}",
    "https://visionary-ai.vercel.app", # Add your Vercel domain here
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(images.router)

@app.get("/")
async def root():
    return {"message": "Welcome to the AI Image Generator API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Endpoints will be implemented here

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 