from datetime import datetime
import re
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


# -----------------------------------------------------------------------------
# Base Schema with ORM Support
# -----------------------------------------------------------------------------
class ORMBaseModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# -----------------------------------------------------------------------------
# Authentication Schemas
# -----------------------------------------------------------------------------
class AdminLogin(BaseModel):
    username: str = Field(..., min_length=1, description="Admin username")
    password: str = Field(..., min_length=1, description="Admin password")


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    username: Optional[str] = None


class AdminResponse(ORMBaseModel):
    id: int
    username: str
    created_at: datetime


class AdminPasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6)


# -----------------------------------------------------------------------------
# Profile Schemas
# -----------------------------------------------------------------------------
class ProfileBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=150)
    tagline: Optional[str] = Field(None, max_length=255)
    bio: Optional[str] = None
    summary: Optional[str] = None
    resume_url: Optional[str] = Field(None, max_length=500)
    social_links: Dict[str, Any] = Field(default_factory=dict)
    email: Optional[str] = Field(None, max_length=255)
    location: Optional[str] = Field(None, max_length=150)


class ProfileCreate(ProfileBase):
    pass


class ProfileUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=150)
    tagline: Optional[str] = Field(None, max_length=255)
    bio: Optional[str] = None
    summary: Optional[str] = None
    resume_url: Optional[str] = Field(None, max_length=500)
    social_links: Optional[Dict[str, Any]] = None
    email: Optional[str] = Field(None, max_length=255)
    location: Optional[str] = Field(None, max_length=150)


class ProfileResponse(ProfileBase, ORMBaseModel):
    id: int
    updated_at: Optional[datetime] = None


# -----------------------------------------------------------------------------
# Project Schemas
# -----------------------------------------------------------------------------
class ProjectBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    slug: Optional[str] = Field(None, max_length=255)
    description: str
    long_description: Optional[str] = None
    category: str = Field(..., min_length=1, max_length=100)
    technologies: List[str] = Field(default_factory=list)
    github_url: Optional[str] = Field(None, max_length=500)
    live_url: Optional[str] = Field(None, max_length=500)
    image_url: Optional[str] = Field(None, max_length=500)
    featured: bool = False
    display_order: int = 0

    @field_validator("slug", mode="before")
    @classmethod
    def generate_slug_if_missing(cls, v, info):
        if not v and info.data.get("title"):
            slug = re.sub(r"[^\w\s-]", "", info.data["title"]).strip().lower()
            return re.sub(r"[-\s]+", "-", slug)
        return v


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    slug: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    long_description: Optional[str] = None
    category: Optional[str] = Field(None, min_length=1, max_length=100)
    technologies: Optional[List[str]] = None
    github_url: Optional[str] = Field(None, max_length=500)
    live_url: Optional[str] = Field(None, max_length=500)
    image_url: Optional[str] = Field(None, max_length=500)
    featured: Optional[bool] = None
    display_order: Optional[int] = None


class ProjectResponse(ProjectBase, ORMBaseModel):
    id: int
    slug: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


# -----------------------------------------------------------------------------
# Skill Schemas
# -----------------------------------------------------------------------------
class SkillBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    category: str = Field(..., min_length=1, max_length=100)
    proficiency: int = Field(default=0, ge=0, le=100)
    icon: Optional[str] = Field(None, max_length=100)
    display_order: int = 0


class SkillCreate(SkillBase):
    pass


class SkillUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    category: Optional[str] = Field(None, min_length=1, max_length=100)
    proficiency: Optional[int] = Field(None, ge=0, le=100)
    icon: Optional[str] = Field(None, max_length=100)
    display_order: Optional[int] = None


class SkillResponse(SkillBase, ORMBaseModel):
    id: int


class SkillCategoryGroup(BaseModel):
    category: str
    skills: List[SkillResponse]


# -----------------------------------------------------------------------------
# Education Schemas
# -----------------------------------------------------------------------------
class EducationBase(BaseModel):
    institution: str = Field(..., min_length=1, max_length=255)
    degree: str = Field(..., min_length=1, max_length=255)
    field: Optional[str] = Field(None, max_length=255)
    start_year: str = Field(..., min_length=1, max_length=50)
    end_year: Optional[str] = Field(None, max_length=50)
    gpa: Optional[float] = None
    description: Optional[str] = None
    display_order: int = 0


class EducationCreate(EducationBase):
    pass


class EducationUpdate(BaseModel):
    institution: Optional[str] = Field(None, min_length=1, max_length=255)
    degree: Optional[str] = Field(None, min_length=1, max_length=255)
    field: Optional[str] = Field(None, max_length=255)
    start_year: Optional[str] = Field(None, max_length=50)
    end_year: Optional[str] = Field(None, max_length=50)
    gpa: Optional[float] = None
    description: Optional[str] = None
    display_order: Optional[int] = None


class EducationResponse(EducationBase, ORMBaseModel):
    id: int


# -----------------------------------------------------------------------------
# Experience Schemas
# -----------------------------------------------------------------------------
class ExperienceBase(BaseModel):
    company: str = Field(..., min_length=1, max_length=255)
    role: str = Field(..., min_length=1, max_length=255)
    type: Optional[str] = Field(None, max_length=100)
    start_date: str = Field(..., min_length=1, max_length=100)
    end_date: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    technologies: List[str] = Field(default_factory=list)
    current: bool = False
    display_order: int = 0


class ExperienceCreate(ExperienceBase):
    pass


class ExperienceUpdate(BaseModel):
    company: Optional[str] = Field(None, min_length=1, max_length=255)
    role: Optional[str] = Field(None, min_length=1, max_length=255)
    type: Optional[str] = Field(None, max_length=100)
    start_date: Optional[str] = Field(None, max_length=100)
    end_date: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    technologies: Optional[List[str]] = None
    current: Optional[bool] = None
    display_order: Optional[int] = None


class ExperienceResponse(ExperienceBase, ORMBaseModel):
    id: int


# -----------------------------------------------------------------------------
# Certification Schemas
# -----------------------------------------------------------------------------
class CertificationBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    issuer: str = Field(..., min_length=1, max_length=255)
    date: Optional[str] = Field(None, max_length=100)
    credential_url: Optional[str] = Field(None, max_length=500)
    image_url: Optional[str] = Field(None, max_length=500)
    display_order: int = 0


class CertificationCreate(CertificationBase):
    pass


class CertificationUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    issuer: Optional[str] = Field(None, min_length=1, max_length=255)
    date: Optional[str] = Field(None, max_length=100)
    credential_url: Optional[str] = Field(None, max_length=500)
    image_url: Optional[str] = Field(None, max_length=500)
    display_order: Optional[int] = None


class CertificationResponse(CertificationBase, ORMBaseModel):
    id: int


# -----------------------------------------------------------------------------
# Achievement Schemas
# -----------------------------------------------------------------------------
class AchievementBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    date: Optional[str] = Field(None, max_length=100)
    category: Optional[str] = Field(None, max_length=100)
    display_order: int = 0


class AchievementCreate(AchievementBase):
    pass


class AchievementUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    date: Optional[str] = Field(None, max_length=100)
    category: Optional[str] = Field(None, max_length=100)
    display_order: Optional[int] = None


class AchievementResponse(AchievementBase, ORMBaseModel):
    id: int


# -----------------------------------------------------------------------------
# BlogPost Schemas
# -----------------------------------------------------------------------------
class BlogPostBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    slug: Optional[str] = Field(None, max_length=255)
    excerpt: Optional[str] = None
    content: str
    cover_image: Optional[str] = Field(None, max_length=500)
    tags: List[str] = Field(default_factory=list)
    published: bool = False
    published_at: Optional[datetime] = None

    @field_validator("slug", mode="before")
    @classmethod
    def generate_slug_if_missing(cls, v, info):
        if not v and info.data.get("title"):
            slug = re.sub(r"[^\w\s-]", "", info.data["title"]).strip().lower()
            return re.sub(r"[-\s]+", "-", slug)
        return v


class BlogPostCreate(BlogPostBase):
    pass


class BlogPostUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    slug: Optional[str] = Field(None, max_length=255)
    excerpt: Optional[str] = None
    content: Optional[str] = None
    cover_image: Optional[str] = Field(None, max_length=500)
    tags: Optional[List[str]] = None
    published: Optional[bool] = None
    published_at: Optional[datetime] = None


class BlogPostResponse(BlogPostBase, ORMBaseModel):
    id: int
    slug: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


# -----------------------------------------------------------------------------
# Testimonial Schemas
# -----------------------------------------------------------------------------
class TestimonialBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    role: str = Field(..., min_length=1, max_length=255)
    company: Optional[str] = Field(None, max_length=255)
    content: str
    avatar_url: Optional[str] = Field(None, max_length=500)
    visible: bool = True
    display_order: int = 0


class TestimonialCreate(TestimonialBase):
    pass


class TestimonialUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    role: Optional[str] = Field(None, min_length=1, max_length=255)
    company: Optional[str] = Field(None, max_length=255)
    content: Optional[str] = None
    avatar_url: Optional[str] = Field(None, max_length=500)
    visible: Optional[bool] = None
    display_order: Optional[int] = None


class TestimonialResponse(TestimonialBase, ORMBaseModel):
    id: int


# -----------------------------------------------------------------------------
# Contact Form & Message Schemas
# -----------------------------------------------------------------------------
class ContactForm(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="Sender's full name")
    email: EmailStr = Field(..., description="Valid contact email address")
    subject: str = Field(..., min_length=2, max_length=200, description="Message subject")
    message: str = Field(..., min_length=5, max_length=5000, description="Message body")


class ContactMessageCreate(ContactForm):
    pass


class ContactMessageUpdate(BaseModel):
    read: Optional[bool] = None


class ContactMessageResponse(ORMBaseModel):
    id: int
    name: str
    email: str
    subject: str
    message: str
    read: bool
    created_at: datetime


# -----------------------------------------------------------------------------
# Analytics Schemas
# -----------------------------------------------------------------------------
class AnalyticsCreate(BaseModel):
    page: str = Field(..., min_length=1, max_length=255)
    event: str = Field(default="pageview", max_length=100)
    referrer: Optional[str] = Field(None, max_length=500)
    user_agent: Optional[str] = Field(None, max_length=500)


class AnalyticsResponse(ORMBaseModel):
    id: int
    page: str
    event: str
    referrer: Optional[str] = None
    user_agent: Optional[str] = None
    ip_address: Optional[str] = None
    created_at: datetime


class PageViewStat(BaseModel):
    page: str
    views: int


class DailyViewStat(BaseModel):
    date: str
    views: int


class AnalyticsSummary(BaseModel):
    total_views: int
    unique_visitors: int
    views_by_page: List[PageViewStat]
    views_by_day: List[DailyViewStat]


# -----------------------------------------------------------------------------
# Search Schemas
# -----------------------------------------------------------------------------
class SearchQuery(BaseModel):
    q: str = Field(..., min_length=1, max_length=100, description="Search term")


class SearchResultItem(BaseModel):
    type: str  # 'project', 'blog', 'skill'
    id: int
    title: str
    subtitle: Optional[str] = None
    description: Optional[str] = None
    slug: Optional[str] = None
    category: Optional[str] = None
    url: Optional[str] = None


class SearchResponse(BaseModel):
    query: str
    total: int
    results: List[SearchResultItem]


# -----------------------------------------------------------------------------
# Dashboard Stats Schemas
# -----------------------------------------------------------------------------
class DashboardStats(BaseModel):
    total_projects: int
    total_skills: int
    total_blogs: int
    published_blogs: int
    total_messages: int
    unread_messages: int
    total_page_views: int
    recent_messages: List[ContactMessageResponse]


# -----------------------------------------------------------------------------
# File Upload Schemas
# -----------------------------------------------------------------------------
class FileUploadResponse(BaseModel):
    filename: str
    url: str
    size: int
    content_type: str
