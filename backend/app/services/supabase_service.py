import os
import json
import psycopg2
import psycopg2.extras
import uuid
from typing import List, Optional, Dict, Any
from dotenv import load_dotenv
from ..models.image import ImageMetadata, Comment, CommentResponse
from ..models.user import User

# Load environment variables
load_dotenv()

# Database connection parameters
db_url = os.getenv("DATABASE_URL")

def get_connection():
    """Get a PostgreSQL database connection"""
    return psycopg2.connect(db_url, cursor_factory=psycopg2.extras.RealDictCursor)

async def get_user_id_by_email(email: str) -> Optional[str]:
    """
    Get a user's ID by their email address
    """
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                query = """
                SELECT id FROM "User" 
                WHERE email = %s
                """
                cur.execute(query, (email,))
                result = cur.fetchone()
                if result:
                    return result["id"]
                return None
    except Exception as e:
        print(f"Error getting user ID by email: {e}")
        return None

async def save_image_metadata(
    user_id: str,
    image_url: str,
    prompt: str,
    refined_prompt: Optional[str] = None
) -> Optional[str]:
    """
    Save image metadata to database
    Returns the ID of the created record
    """
    try:
        # First, check if user_id is an email and get the actual user ID if needed
        if "@" in user_id:
            # This looks like an email address, get the actual user ID
            actual_user_id = await get_user_id_by_email(user_id)
            if not actual_user_id:
                print(f"No user found with email: {user_id}")
                return None
            user_id = actual_user_id

        with get_connection() as conn:
            with conn.cursor() as cur:
                # Generate a unique ID for the image
                image_id = str(uuid.uuid4())
                
                query = """
                INSERT INTO "Image" (id, "userId", image_url, prompt, refined_prompt, likes)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id
                """
                cur.execute(query, (image_id, user_id, image_url, prompt, refined_prompt, 0))
                result = cur.fetchone()
                if result:
                    return result["id"]
                return None
    except Exception as e:
        print(f"Error saving image metadata: {e}")
        return None

async def get_user_images(user_id: str) -> List[ImageMetadata]:
    """
    Get all images for a specific user
    """
    try:
        # First, check if user_id is an email and get the actual user ID if needed
        if "@" in user_id:
            # This looks like an email address, get the actual user ID
            actual_user_id = await get_user_id_by_email(user_id)
            if not actual_user_id:
                print(f"No user found with email: {user_id}")
                return []
            user_id = actual_user_id
            
        with get_connection() as conn:
            with conn.cursor() as cur:
                query = """
                SELECT i.*, u.name as "userName"
                FROM "Image" i
                LEFT JOIN "User" u ON i."userId" = u.id
                WHERE i."userId" = %s
                ORDER BY i.created_at DESC
                """
                cur.execute(query, (user_id,))
                results = cur.fetchall()
                return [ImageMetadata(**dict(item)) for item in results]
    except Exception as e:
        print(f"Error getting user images: {e}")
        return []

async def get_explore_images(limit: int = 20, offset: int = 0, sort: Optional[str] = None) -> List[ImageMetadata]:
    """
    Get images for the explore page with pagination
    Parameters:
    - limit: Number of images to return
    - offset: Number of images to skip
    - sort: Optional sorting parameter ('likes' to sort by most liked)
    """
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                # Define the ORDER BY clause based on sort parameter
                order_by = "i.likes DESC, i.created_at DESC" if sort == "likes" else "i.created_at DESC"
                
                query = f"""
                SELECT i.*, u.name as "userName"
                FROM "Image" i
                LEFT JOIN "User" u ON i."userId" = u.id
                ORDER BY {order_by}
                LIMIT %s OFFSET %s
                """
                cur.execute(query, (limit, offset))
                results = cur.fetchall()
                return [ImageMetadata(**dict(item)) for item in results]
    except Exception as e:
        print(f"Error getting explore images: {e}")
        return []

async def like_image(image_id: str, user_id: str) -> bool:
    """
    Like an image
    """
    try:
        # First, check if user_id is an email and get the actual user ID if needed
        if "@" in user_id:
            # This looks like an email address, get the actual user ID
            actual_user_id = await get_user_id_by_email(user_id)
            if not actual_user_id:
                print(f"No user found with email: {user_id}")
                return False
            user_id = actual_user_id
            
        with get_connection() as conn:
            with conn.cursor() as cur:
                # Check if user already liked the image
                check_query = """
                SELECT * FROM "Like"
                WHERE "imageId" = %s AND "userId" = %s
                """
                cur.execute(check_query, (image_id, user_id))
                if cur.fetchone():
                    # User already liked the image
                    return False
                
                # Generate a unique ID for the like
                like_id = str(uuid.uuid4())
                
                # Add like record
                insert_query = """
                INSERT INTO "Like" (id, "imageId", "userId")
                VALUES (%s, %s, %s)
                """
                cur.execute(insert_query, (like_id, image_id, user_id))
                
                # Increment like count
                update_query = """
                UPDATE "Image" 
                SET likes = likes + 1
                WHERE id = %s
                """
                cur.execute(update_query, (image_id,))
                conn.commit()
                return True
    except Exception as e:
        print(f"Error liking image: {e}")
        return False

async def unlike_image(image_id: str, user_id: str) -> bool:
    """
    Unlike an image
    """
    try:
        # First, check if user_id is an email and get the actual user ID if needed
        if "@" in user_id:
            # This looks like an email address, get the actual user ID
            actual_user_id = await get_user_id_by_email(user_id)
            if not actual_user_id:
                print(f"No user found with email: {user_id}")
                return False
            user_id = actual_user_id
            
        with get_connection() as conn:
            with conn.cursor() as cur:
                # Check if user liked the image
                check_query = """
                SELECT * FROM "Like"
                WHERE "imageId" = %s AND "userId" = %s
                """
                cur.execute(check_query, (image_id, user_id))
                if not cur.fetchone():
                    # User hasn't liked the image
                    return False
                
                # Remove like record
                delete_query = """
                DELETE FROM "Like"
                WHERE "imageId" = %s AND "userId" = %s
                """
                cur.execute(delete_query, (image_id, user_id))
                
                # Decrement like count
                update_query = """
                UPDATE "Image" 
                SET likes = GREATEST(likes - 1, 0)
                WHERE id = %s
                """
                cur.execute(update_query, (image_id,))
                conn.commit()
                return True
    except Exception as e:
        print(f"Error unliking image: {e}")
        return False

async def delete_image(image_id: str, user_id: str) -> bool:
    """
    Delete an image (only if it belongs to the user)
    """
    try:
        # First, check if user_id is an email and get the actual user ID if needed
        if "@" in user_id:
            # This looks like an email address, get the actual user ID
            actual_user_id = await get_user_id_by_email(user_id)
            if not actual_user_id:
                print(f"No user found with email: {user_id}")
                return False
            user_id = actual_user_id
            
        with get_connection() as conn:
            with conn.cursor() as cur:
                # Check if image belongs to user
                check_query = """
                SELECT * FROM "Image"
                WHERE id = %s AND "userId" = %s
                """
                cur.execute(check_query, (image_id, user_id))
                if not cur.fetchone():
                    # Image doesn't belong to user
                    return False
                
                # Delete likes for the image
                delete_likes_query = """
                DELETE FROM "Like"
                WHERE "imageId" = %s
                """
                cur.execute(delete_likes_query, (image_id,))
                
                # Delete image record
                delete_image_query = """
                DELETE FROM "Image"
                WHERE id = %s
                """
                cur.execute(delete_image_query, (image_id,))
                conn.commit()
                return True
    except Exception as e:
        print(f"Error deleting image: {e}")
        return False

async def get_user(user_id: str) -> Optional[User]:
    """
    Get user by ID
    """
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                query = """
                SELECT * FROM "User"
                WHERE id = %s
                """
                cur.execute(query, (user_id,))
                result = cur.fetchone()
                if result:
                    return User(**dict(result))
                return None
    except Exception as e:
        print(f"Error getting user: {e}")
        return None

async def get_user_liked_images(user_id: str) -> List[str]:
    """
    Get all image IDs liked by a specific user
    """
    try:
        # First, check if user_id is an email and get the actual user ID if needed
        if "@" in user_id:
            # This looks like an email address, get the actual user ID
            actual_user_id = await get_user_id_by_email(user_id)
            if not actual_user_id:
                print(f"No user found with email: {user_id}")
                return []
            user_id = actual_user_id
            
        with get_connection() as conn:
            with conn.cursor() as cur:
                query = """
                SELECT "imageId" FROM "Like" 
                WHERE "userId" = %s
                """
                cur.execute(query, (user_id,))
                results = cur.fetchall()
                return [item["imageId"] for item in results]
    except Exception as e:
        print(f"Error getting user liked images: {e}")
        return []

async def get_image_by_id(image_id: str) -> Optional[ImageMetadata]:
    """
    Get image metadata by ID
    """
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                # Join with User table to get user name
                query = """
                SELECT i.*, u.name as "userName"
                FROM "Image" i
                LEFT JOIN "User" u ON i."userId" = u.id
                WHERE i.id = %s
                """
                cur.execute(query, (image_id,))
                result = cur.fetchone()
                if result:
                    return ImageMetadata(**dict(result))
                return None
    except Exception as e:
        print(f"Error getting image by ID: {e}")
        return None

async def get_image_comments(image_id: str) -> List[CommentResponse]:
    """
    Get all comments for an image from the database
    """
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                query = """
                SELECT * FROM "Comment"
                WHERE "imageId" = %s
                ORDER BY created_at ASC
                """
                cur.execute(query, (image_id,))
                results = cur.fetchall()
                
                comments = []
                for item in results:
                    comments.append(CommentResponse(
                        id=item["id"],
                        imageId=item["imageId"],
                        userId=item["userId"],
                        userName=item["userName"],
                        text=item["text"],
                        created_at=item["created_at"]
                    ))
                
                return comments
    except Exception as e:
        print(f"Error getting comments: {e}")
        return []

async def create_comment(comment: Comment) -> CommentResponse:
    """
    Create a new comment in the database
    """
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                query = """
                INSERT INTO "Comment" (id, "imageId", "userId", "userName", text, created_at)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING *
                """
                cur.execute(query, (
                    comment.id,
                    comment.imageId,
                    comment.userId,
                    comment.userName,
                    comment.text,
                    comment.created_at
                ))
                result = cur.fetchone()
                conn.commit()
                
                if not result:
                    raise Exception("Failed to create comment")
                
                return CommentResponse(
                    id=result["id"],
                    imageId=result["imageId"],
                    userId=result["userId"],
                    userName=result["userName"],
                    text=result["text"],
                    created_at=result["created_at"]
                )
    except Exception as e:
        print(f"Error creating comment: {e}")
        raise 