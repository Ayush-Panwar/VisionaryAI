from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field

class User(BaseModel):
    id: str
    name: Optional[str] = None
    email: Optional[str] = None
    emailVerified: Optional[datetime] = None
    image: Optional[str] = None
    created_at: Optional[datetime] = None 