from fastapi import APIRouter, Depends, HTTPException, status, Header
from typing import List, Optional
from ..models.image import ImagePrompt, ImageResponse, ImageMetadata, LikeRequest, SaveImageRequest, UploadImageRequest, Comment, CreateCommentRequest, CommentResponse, CommentsListResponse
from ..services import openai_service, cloudinary_service, supabase_service

router = APIRouter(
    prefix="/images",
    tags=["images"]
)

@router.post("/generate", response_model=ImageResponse)
async def generate_image(
    image_prompt: ImagePrompt,
    user_id: str = Header(..., description="User ID from authentication")
):
    """
    Generate an image based on the provided prompt
    """
    prompt = image_prompt.prompt
    refined_prompt = None
    
    # Refine prompt if requested
    if image_prompt.refine_prompt:
        refined_prompt = await openai_service.refine_prompt(prompt)
        prompt_to_use = refined_prompt
    else:
        prompt_to_use = prompt
    
    # Generate image
    image_url = await openai_service.generate_image(prompt_to_use)
    if not image_url:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate image"
        )
    
    # Skip Cloudinary upload if requested
    if not image_prompt.skip_cloudinary:
        # Upload to Cloudinary
        cloudinary_url = await cloudinary_service.upload_image_from_url(image_url)
        if not cloudinary_url:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to upload image to storage"
            )
        
        # Return the Cloudinary URL
        return ImageResponse(
            image_url=cloudinary_url,
            prompt=prompt,
            refined_prompt=refined_prompt
        )
    
    # Return the original image URL without uploading to Cloudinary
    return ImageResponse(
        image_url=image_url,
        prompt=prompt,
        refined_prompt=refined_prompt
    )

@router.post("/upload", response_model=dict)
async def upload_image(
    upload_request: UploadImageRequest,
    user_id: str = Header(..., description="User ID from authentication")
):
    """
    Upload a generated image to Cloudinary
    """
    # Upload to Cloudinary
    cloudinary_url = await cloudinary_service.upload_image_from_url(upload_request.image_url)
    if not cloudinary_url:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload image to storage"
        )
    
    return {"cloudinary_url": cloudinary_url}

@router.post("/save", response_model=ImageMetadata)
async def save_image(
    save_request: SaveImageRequest,
    user_id: str = Header(..., description="User ID from authentication")
):
    """
    Save a generated image to the user's dashboard
    """
    # Save metadata to database
    image_id = await supabase_service.save_image_metadata(
        user_id=user_id,
        image_url=save_request.image_url,
        prompt=save_request.prompt,
        refined_prompt=save_request.refined_prompt
    )
    
    if not image_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save image metadata"
        )
    
    # Get the saved image metadata
    image = await supabase_service.get_image_by_id(image_id)
    if not image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Failed to retrieve saved image"
        )
    
    return image

@router.get("/user", response_model=List[ImageMetadata])
async def get_user_images(
    user_id: str = Header(..., description="User ID from authentication")
):
    """
    Get all images for the current user
    """
    images = await supabase_service.get_user_images(user_id)
    return images

@router.get("/explore", response_model=List[ImageMetadata])
async def get_explore_images(
    limit: int = 20,
    offset: int = 0,
    sort: Optional[str] = None
):
    """
    Get images for the explore page with pagination
    Parameters:
    - limit: Number of images to return
    - offset: Number of images to skip
    - sort: Optional sorting parameter ('likes' to sort by most liked)
    """
    images = await supabase_service.get_explore_images(limit, offset, sort)
    return images

@router.post("/like", status_code=status.HTTP_200_OK)
async def like_image(
    like_request: LikeRequest
):
    """
    Like an image
    """
    success = await supabase_service.like_image(
        image_id=like_request.imageId,
        user_id=like_request.userId
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to like image or image already liked"
        )
    
    return {"message": "Image liked successfully"}

@router.post("/unlike", status_code=status.HTTP_200_OK)
async def unlike_image(
    like_request: LikeRequest
):
    """
    Unlike an image
    """
    success = await supabase_service.unlike_image(
        image_id=like_request.imageId,
        user_id=like_request.userId
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to unlike image or image not liked"
        )
    
    return {"message": "Image unliked successfully"}

@router.delete("/{image_id}", status_code=status.HTTP_200_OK)
async def delete_image(
    image_id: str,
    user_id: str = Header(..., description="User ID from authentication")
):
    """
    Delete an image (only if it belongs to the user)
    """
    success = await supabase_service.delete_image(image_id, user_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to delete image or image doesn't belong to user"
        )
    
    return {"message": "Image deleted successfully"}

@router.get("/liked", response_model=List[str])
async def get_user_liked_images(
    user_id: str = Header(..., description="User ID from authentication")
):
    """
    Get all image IDs liked by the current user
    """
    liked_images = await supabase_service.get_user_liked_images(user_id)
    return liked_images

@router.get("/{image_id}", response_model=ImageMetadata)
async def get_image_by_id(image_id: str):
    """
    Get a single image by ID
    """
    image = await supabase_service.get_image_by_id(image_id)
    
    if not image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found"
        )
    
    return image

@router.get("/{image_id}/comments", response_model=CommentsListResponse)
async def get_image_comments(image_id: str):
    """
    Get all comments for an image
    """
    try:
        comments = await supabase_service.get_image_comments(image_id)
        return CommentsListResponse(comments=comments)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get comments: {str(e)}"
        )

@router.post("/{image_id}/comments", response_model=CommentResponse)
async def create_comment(image_id: str, comment_request: CreateCommentRequest):
    """
    Create a new comment for an image
    """
    try:
        # Create comment object
        comment = Comment(
            imageId=image_id,
            userId=comment_request.userId,
            userName=comment_request.userName,
            text=comment_request.text
        )
        
        # Save to database
        saved_comment = await supabase_service.create_comment(comment)
        
        return saved_comment
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create comment: {str(e)}"
        ) 