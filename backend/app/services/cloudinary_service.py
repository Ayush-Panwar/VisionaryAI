import os
import cloudinary
import cloudinary.uploader
import requests
from typing import Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

async def upload_image_from_url(image_url: str, folder: str = "ai-images") -> Optional[str]:
    """
    Upload an image to Cloudinary from a URL
    Returns the Cloudinary URL of the uploaded image
    """
    try:
        # Download the image from the URL
        response = requests.get(image_url)
        if response.status_code != 200:
            print(f"Failed to download image from URL: {response.status_code}")
            return None
            
        # Upload to Cloudinary
        result = cloudinary.uploader.upload(
            response.content,
            folder=folder,
            resource_type="image"
        )
        
        return result["secure_url"]
    except Exception as e:
        print(f"Error uploading image to Cloudinary: {e}")
        return None

async def delete_image(public_id: str) -> bool:
    """
    Delete an image from Cloudinary by its public ID
    Returns True if successful, False otherwise
    """
    try:
        result = cloudinary.uploader.destroy(public_id)
        return result["result"] == "ok"
    except Exception as e:
        print(f"Error deleting image from Cloudinary: {e}")
        return False 