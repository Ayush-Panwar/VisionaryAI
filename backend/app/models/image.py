from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field, HttpUrl
import uuid

class ImagePrompt(BaseModel):
    prompt: str
    refine_prompt: bool = False
    skip_cloudinary: bool = False  # Flag to skip Cloudinary upload during generation

class ImageResponse(BaseModel):
    image_url: str
    prompt: str
    refined_prompt: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)

class ImageMetadata(BaseModel):
    id: str
    userId: str
    image_url: str
    prompt: str
    refined_prompt: Optional[str] = None
    created_at: datetime
    likes: int = 0
    userName: Optional[str] = None

class LikeRequest(BaseModel):
    imageId: str
    userId: str

class SaveImageRequest(BaseModel):
    image_url: str
    prompt: str
    refined_prompt: Optional[str] = None 
    userId: Optional[str] = None  # Make userId optional since it's passed in the header

class UploadImageRequest(BaseModel):
    image_url: str  # Original image URL to upload to Cloudinary 

class Comment(BaseModel):
    """Comment model for image comments"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    imageId: str
    userId: str
    userName: str
    text: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class CreateCommentRequest(BaseModel):
    """Request to create a new comment"""
    text: str
    userId: str
    userName: str

class CommentResponse(BaseModel):
    """Response containing a comment"""
    id: str
    imageId: str
    userId: str
    userName: str
    text: str
    created_at: datetime

class CommentsListResponse(BaseModel):
    """Response containing a list of comments"""
    comments: List[CommentResponse] 