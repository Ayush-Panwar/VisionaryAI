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
render_url = os.getenv("RENDER_URL", "")

allowed_origins = [
    frontend_url,
    "http://localhost:3000",
    "https://localhost:3000",
    f"https://{vercel_url}",
    f"https://*.vercel.app",
    "https://visionary-ai.vercel.app", 
    "https://*.render.com",
    "*"  # Adding a wildcard for development purposes - remove in production if strict security is required
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Add middleware to print request info for debugging
@app.middleware("http")
async def log_requests(request, call_next):
    print(f"Request: {request.method} {request.url}")
    print(f"Headers: {request.headers}")
    response = await call_next(request)
    print(f"Response status: {response.status_code}")
    return response

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