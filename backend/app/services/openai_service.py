import os
import openai
from typing import Optional, Dict, Any
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize OpenAI client
client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

async def refine_prompt(prompt: str) -> str:
    """
    Use GPT-4 to refine the user's prompt for better image generation
    """
    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert at creating detailed, descriptive prompts for DALL-E image generation. Your task is to enhance the user's prompt to create a more vivid, detailed image. Keep the core idea but add details about style, lighting, composition, and mood. Don't make it too long - aim for 2-3 sentences maximum."},
                {"role": "user", "content": f"Please enhance this image prompt: {prompt}"}
            ],
            max_tokens=150
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error refining prompt: {e}")
        return prompt  # Return original prompt if refinement fails

async def generate_image(prompt: str) -> Optional[str]:
    """
    Generate an image using DALL-E 3 based on the provided prompt
    Returns the URL of the generated image
    """
    try:
        response = client.images.generate(
            model="dall-e-3",
            prompt=prompt,
            size="1024x1024",
            quality="standard",
            n=1
        )
        return response.data[0].url
    except Exception as e:
        print(f"Error generating image: {e}")
        return None 