import os
import re
import uuid
import aiofiles
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    Query,
    UploadFile,
    status,
)
from sqlalchemy import desc, func
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin, get_db, require_admin
from app.core.config import settings
from app.core.security import create_access_token, verify_password
from app.models.models import (
    Admin,
    Profile,
    Project,
    Skill,
    Education,
    Experience,
    Certification,
    Achievement,
    BlogPost,
    Testimonial,
    ContactMessage,
    Analytics,
)
from app.schemas.schemas import (
    AdminLogin,
    AdminResponse,
    Token,
    DashboardStats,
    ProfileUpdate,
    ProfileResponse,
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse,
    SkillCreate,
    SkillUpdate,
    SkillResponse,
    EducationCreate,
    EducationUpdate,
    EducationResponse,
    ExperienceCreate,
    ExperienceUpdate,
    ExperienceResponse,
    CertificationCreate,
    CertificationUpdate,
    CertificationResponse,
    AchievementCreate,
    AchievementUpdate,
    AchievementResponse,
    BlogPostCreate,
    BlogPostUpdate,
    BlogPostResponse,
    TestimonialCreate,
    TestimonialUpdate,
    TestimonialResponse,
    ContactMessageResponse,
    ContactMessageUpdate,
    AnalyticsSummary,
    PageViewStat,
    DailyViewStat,
    FileUploadResponse,
)

router = APIRouter(prefix="/admin", tags=["admin"])


# -----------------------------------------------------------------------------
# Helper: Slug generator
# -----------------------------------------------------------------------------
def slugify(text: str) -> str:
    cleaned = re.sub(r"[^\w\s-]", "", text).strip().lower()
    return re.sub(r"[-\s]+", "-", cleaned)


# -----------------------------------------------------------------------------
# Authentication Endpoints
# -----------------------------------------------------------------------------
@router.post("/login", response_model=Token)
def admin_login(
    login_data: AdminLogin,
    db: Session = Depends(get_db),
):
    """Authenticate admin credentials and issue a signed JWT access token."""
    admin = db.query(Admin).filter(Admin.username == login_data.username).first()
    if not admin or not verify_password(login_data.password, admin.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": admin.username})
    return Token(access_token=access_token, token_type="bearer")


@router.get("/me", response_model=AdminResponse)
def get_admin_profile(current_admin: Admin = Depends(require_admin)):
    """Retrieve details of the currently authenticated administrator."""
    return current_admin


# -----------------------------------------------------------------------------
# Dashboard Overview
# -----------------------------------------------------------------------------
@router.get("/dashboard", response_model=DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_admin),
):
    """Retrieve aggregate metric counters and recent inquiries for the admin dashboard."""
    total_projects = db.query(Project).count()
    total_skills = db.query(Skill).count()
    total_blogs = db.query(BlogPost).count()
    published_blogs = db.query(BlogPost).filter(BlogPost.published == True).count()  # noqa: E712
    total_messages = db.query(ContactMessage).count()
    unread_messages = db.query(ContactMessage).filter(ContactMessage.read == False).count()  # noqa: E712
    total_page_views = db.query(Analytics).count()

    recent_messages = (
        db.query(ContactMessage)
        .order_by(ContactMessage.created_at.desc())
        .limit(5)
        .all()
    )

    return DashboardStats(
        total_projects=total_projects,
        total_skills=total_skills,
        total_blogs=total_blogs,
        published_blogs=published_blogs,
        total_messages=total_messages,
        unread_messages=unread_messages,
        total_page_views=total_page_views,
        recent_messages=recent_messages,
    )


# -----------------------------------------------------------------------------
# Profile Management
# -----------------------------------------------------------------------------
@router.put("/profile", response_model=ProfileResponse)
def update_profile(
    profile_data: ProfileUpdate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_admin),
):
    """Update or initialize the portfolio owner profile."""
    profile = db.query(Profile).first()
    if not profile:
        profile = Profile(
            name=profile_data.name or "Mukesh Pramanik",
            tagline=profile_data.tagline,
            bio=profile_data.bio,
            summary=profile_data.summary,
            resume_url=profile_data.resume_url,
            social_links=profile_data.social_links or {},
            email=profile_data.email,
            location=profile_data.location,
        )
        db.add(profile)
    else:
        update_dict = profile_data.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            setattr(profile, key, value)

    db.commit()
    db.refresh(profile)
    return profile


# -----------------------------------------------------------------------------
# Projects CRUD
# -----------------------------------------------------------------------------
@router.get("/projects", response_model=List[ProjectResponse])
def admin_list_projects(
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_admin),
):
    """List all portfolio projects including non-featured ones for admin management."""
    return db.query(Project).order_by(Project.display_order.asc(), Project.created_at.desc()).all()


@router.post("/projects", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def admin_create_project(
    project_in: ProjectCreate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_admin),
):
    """Create a new portfolio project."""
    slug = project_in.slug or slugify(project_in.title)
    # Ensure unique slug
    base_slug = slug
    counter = 1
    while db.query(Project).filter(Project.slug == slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1

    project = Project(
        title=project_in.title,
        slug=slug,
        description=project_in.description,
        long_description=project_in.long_description,
        category=project_in.category,
        technologies=project_in.technologies,
        github_url=project_in.github_url,
        live_url=project_in.live_url,
        image_url=project_in.image_url,
        featured=project_in.featured,
        display_order=project_in.display_order,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.get("/projects/{project_id}", response_model=ProjectResponse)
def admin_get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_admin),
):
    """Get project details by ID."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project


@router.put("/projects/{project_id}", response_model=ProjectResponse)
def admin_update_project(
    project_id: int,
    project_in: ProjectUpdate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_admin),
):
    """Update project fields."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    update_dict = project_in.model_dump(exclude_unset=True)
    if "slug" in update_dict and update_dict["slug"]:
        # Check if slug taken by another project
        existing = db.query(Project).filter(Project.slug == update_dict["slug"], Project.id != project_id).first()
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Slug already in use")

    for key, value in update_dict.items():
        setattr(project, key, value)

    db.commit()
    db.refresh(project)
    return project


@router.delete("/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_admin),
):
    """Delete a project."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    db.delete(project)
    db.commit()
    return None


# -----------------------------------------------------------------------------
# Skills CRUD
# -----------------------------------------------------------------------------
@router.get("/skills", response_model=List[SkillResponse])
def admin_list_skills(
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_admin),
):
    """List all skills for administrative editing."""
    return db.query(Skill).order_by(Skill.category.asc(), Skill.display_order.asc()).all()


@router.post("/skills", response_model=SkillResponse, status_code=status.HTTP_201_CREATED)
def admin_create_skill(
    skill_in: SkillCreate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_admin),
):
    """Create a new skill."""
    skill = Skill(**skill_in.model_dump())
    db.add(skill)
    db.commit()
    db.refresh(skill)
    return skill


@router.get("/skills/{skill_id}", response_model=SkillResponse)
def admin_get_skill(
    skill_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_admin),
):
    """Get a skill by ID."""
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill not found")
    return skill


@router.put("/skills/{skill_id}", response_model=SkillResponse)
def admin_update_skill(
    skill_id: int,
    skill_in: SkillUpdate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_admin),
):
    """Update skill details."""
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill not found")

    for key, value in skill_in.model_dump(exclude_unset=True).items():
        setattr(skill, key, value)

    db.commit()
    db.refresh(skill)
    return skill


@router.delete("/skills/{skill_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_skill(
    skill_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_admin),
):
    """Delete a skill."""
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill not found")
    db.delete(skill)
    db.commit()
    return None


# -----------------------------------------------------------------------------
# Education CRUD
# -----------------------------------------------------------------------------
@router.get("/education", response_model=List[EducationResponse])
def admin_list_education(
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_admin),
):
    """List education entries."""
    return db.query(Education).order_by(Education.display_order.asc(), Education.start_year.desc()).all()


@router.post("/education", response_model=EducationResponse, status_code=status.HTTP_201_CREATED)
def admin_create_education(
    edu_in: EducationCreate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_admin),
):
    """Create an education entry."""
    edu = Education(**edu_in.model_dump())
    db.add(edu)
    db.commit()
    db.refresh(edu)
    return edu


@router.get("/education/{edu_id}", response_model=EducationResponse)
def admin_get_education(
    edu_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_admin),
):
    """Get education by ID."""
    edu = db.query(Education).filter(Education.id == edu_id).first()
    if not edu:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Education record not found")
    return edu


@router.put("/education/{edu_id}", response_model=EducationResponse)
def admin_update_education(
    edu_id: int,
    edu_in: EducationUpdate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_admin),
):
    """Update education record."""
    edu = db.query(Education).filter(Education.id == edu_id).first()
    if not edu:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Education record not found")

    for key, value in edu_in.model_dump(exclude_unset=True).items():
        setattr(edu, key, value)

    db.commit()
    db.refresh(edu)
    return edu


@router.delete("/education/{edu_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_education(
    edu_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_admin),
):
    """Delete education entry."""
    edu = db.query(Education).filter(Education.id == edu_id).first()
    if not edu:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Education record not found")
    db.delete(edu)
    db.commit()
    return None


# -----------------------------------------------------------------------------
# Experience CRUD
# -----------------------------------------------------------------------------
@router.get("/experience", response_model=List[ExperienceResponse])
def admin_list_experience(
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_admin),
):
    """List experience entries."""
    return db.query(Experience).order_by(Experience.display_order.asc(), Experience.start_date.desc()).all()


@router.post("/experience", response_model=ExperienceResponse, status_code=status.HTTP_201_CREATED)
def admin_create_experience(
    exp_in: ExperienceCreate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_admin),
):
    """Create a new experience entry."""
    exp = Experience(**exp_in.model_dump())
    db.add(exp)
    db.commit()
    db.refresh(exp)
    return exp


@router.get("/experience/{exp_id}", response_model=ExperienceResponse)
def admin_get_experience(
    exp_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_admin),
):
    """Get experience record by ID."""
    exp = db.query(Experience).filter(Experience.id == exp_id).first()
    if not exp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Experience record not found")
    return exp


@router.put("/experience/{exp_id}", response_model=ExperienceResponse)
def admin_update_experience(
    exp_id: int,
    exp_in: ExperienceUpdate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_admin),
):
    """Update experience record."""
    exp = db.query(Experience).filter(Experience.id == exp_id).first()
    if not exp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Experience record not found")

    for key, value in exp_in.model_dump(exclude_unset=True).items():
        setattr(exp, key, value)

    db.commit()
    db.refresh(exp)
    return exp


@router.delete("/experience/{exp_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_experience(
    exp_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_admin),
):
    """Delete experience record."""
    exp = db.query(Experience).filter(Experience.id == exp_id).first()
    if not exp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Experience record not found")
    db.delete(exp)
    db.commit()
    return None


# -----------------------------------------------------------------------------
# Certifications CRUD
# -----------------------------------------------------------------------------
@router.get("/certifications", response_model=List[CertificationResponse])
def admin_list_certifications(
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_admin),
):
    """List certifications."""
    return db.query(Certification).order_by(Certification.display_order.asc()).all()


@router.post("/certifications", response_model=CertificationResponse, status_code=status.HTTP_201_CREATED)
def admin_create_certification(
    cert_in: CertificationCreate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_admin),
):
    """Create certification."""
    cert = Certification(**cert_in.model_dump())
    db.add(cert)
    db.commit()
    db.refresh(cert)
    return cert


@router.get("/certifications/{cert_id}", response_model=CertificationResponse)
def admin_get_certification(
    cert_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_admin),
):
    """Get certification by ID."""
    cert = db.query(Certification).filter(Certification.id == cert_id).first()
    if not cert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Certification not found")
    return cert


@router.put("/certifications/{cert_id}", response_model=CertificationResponse)
def admin_update_certification(
    cert_id: int,
    cert_in: CertificationUpdate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_admin),
):
    """Update certification."""
    cert = db.query(Certification).filter(Certification.id == cert_id).first()
    if not cert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Certification not found")

    for key, value in cert_in.model_dump(exclude_unset=True).items():
        setattr(cert, key, value)

    db.commit()
    db.refresh(cert)
    return cert


@router.delete("/certifications/{cert_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_certification(
    cert_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_admin),
):
    """Delete certification."""
    cert = db.query(Certification).filter(Certification.id == cert_id).first()
    if not cert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Certification not found")
    db.delete(cert)
    db.commit()
    return None


# -----------------------------------------------------------------------------
# Achievements CRUD
# -----------------------------------------------------------------------------
@router.get("/achievements", response_model=List[AchievementResponse])
def admin_list_achievements(
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_admin),
):
    """List achievements."""
    return db.query(Achievement).order_by(Achievement.display_order.asc()).all()


@router.post("/achievements", response_model=AchievementResponse, status_code=status.HTTP_201_CREATED)
def admin_create_achievement(
    ach_in: AchievementCreate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_admin),
):
    """Create achievement."""
    ach = Achievement(**ach_in.model_dump())
    db.add(ach)
    db.commit()
    db.refresh(ach)
    return ach


@router.get("/achievements/{ach_id}", response_model=AchievementResponse)
def admin_get_achievement(
    ach_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_admin),
):
    """Get achievement by ID."""
    ach = db.query(Achievement).filter(Achievement.id == ach_id).first()
    if not ach:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Achievement not found")
    return ach


@router.put("/achievements/{ach_id}", response_model=AchievementResponse)
def admin_update_achievement(
    ach_id: int,
    ach_in: AchievementUpdate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_admin),
):
    """Update achievement."""
    ach = db.query(Achievement).filter(Achievement.id == ach_id).first()
    if not ach:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Achievement not found")

    for key, value in ach_in.model_dump(exclude_unset=True).items():
        setattr(ach, key, value)

    db.commit()
    db.refresh(ach)
    return ach


@router.delete("/achievements/{ach_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_achievement(
    ach_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_admin),
):
    """Delete achievement."""
    ach = db.query(Achievement).filter(Achievement.id == ach_id).first()
    if not ach:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Achievement not found")
    db.delete(ach)
    db.commit()
    return None


# -----------------------------------------------------------------------------
# Blog Posts CRUD
# -----------------------------------------------------------------------------
@router.get("/blog", response_model=List[BlogPostResponse])
def admin_list_blogs(
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_admin),
):
    """List all blog posts including drafts."""
    return db.query(BlogPost).order_by(BlogPost.created_at.desc()).all()


@router.post("/blog", response_model=BlogPostResponse, status_code=status.HTTP_201_CREATED)
def admin_create_blog(
    blog_in: BlogPostCreate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_admin),
):
    """Create a new blog post."""
    slug = blog_in.slug or slugify(blog_in.title)
    base_slug = slug
    counter = 1
    while db.query(BlogPost).filter(BlogPost.slug == slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1

    published_at = datetime.now(timezone.utc) if blog_in.published and not blog_in.published_at else blog_in.published_at

    blog = BlogPost(
        title=blog_in.title,
        slug=slug,
        excerpt=blog_in.excerpt,
        content=blog_in.content,
        cover_image=blog_in.cover_image,
        tags=blog_in.tags,
        published=blog_in.published,
        published_at=published_at,
    )
    db.add(blog)
    db.commit()
    db.refresh(blog)
    return blog


@router.get("/blog/{blog_id}", response_model=BlogPostResponse)
def admin_get_blog(
    blog_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_admin),
):
    """Get a blog post by ID."""
    blog = db.query(BlogPost).filter(BlogPost.id == blog_id).first()
    if not blog:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Blog post not found")
    return blog


@router.put("/blog/{blog_id}", response_model=BlogPostResponse)
def admin_update_blog(
    blog_id: int,
    blog_in: BlogPostUpdate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_admin),
):
    """Update a blog post."""
    blog = db.query(BlogPost).filter(BlogPost.id == blog_id).first()
    if not blog:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Blog post not found")

    update_dict = blog_in.model_dump(exclude_unset=True)
    if "slug" in update_dict and update_dict["slug"]:
        existing = db.query(BlogPost).filter(BlogPost.slug == update_dict["slug"], BlogPost.id != blog_id).first()
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Slug already in use")

    # If transitioning to published and published_at is not set
    if update_dict.get("published") is True and not blog.published and not update_dict.get("published_at"):
        blog.published_at = datetime.now(timezone.utc)

    for key, value in update_dict.items():
        setattr(blog, key, value)

    db.commit()
    db.refresh(blog)
    return blog


@router.delete("/blog/{blog_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_blog(
    blog_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_admin),
):
    """Delete a blog post."""
    blog = db.query(BlogPost).filter(BlogPost.id == blog_id).first()
    if not blog:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Blog post not found")
    db.delete(blog)
    db.commit()
    return None


# -----------------------------------------------------------------------------
# Testimonials CRUD
# -----------------------------------------------------------------------------
@router.get("/testimonials", response_model=List[TestimonialResponse])
def admin_list_testimonials(
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_admin),
):
    """List all testimonials including hidden ones."""
    return db.query(Testimonial).order_by(Testimonial.display_order.asc()).all()


@router.post("/testimonials", response_model=TestimonialResponse, status_code=status.HTTP_201_CREATED)
def admin_create_testimonial(
    test_in: TestimonialCreate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_admin),
):
    """Create a testimonial."""
    item = Testimonial(**test_in.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.get("/testimonials/{test_id}", response_model=TestimonialResponse)
def admin_get_testimonial(
    test_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_admin),
):
    """Get testimonial by ID."""
    item = db.query(Testimonial).filter(Testimonial.id == test_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Testimonial not found")
    return item


@router.put("/testimonials/{test_id}", response_model=TestimonialResponse)
def admin_update_testimonial(
    test_id: int,
    test_in: TestimonialUpdate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_admin),
):
    """Update testimonial."""
    item = db.query(Testimonial).filter(Testimonial.id == test_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Testimonial not found")

    for key, value in test_in.model_dump(exclude_unset=True).items():
        setattr(item, key, value)

    db.commit()
    db.refresh(item)
    return item


@router.delete("/testimonials/{test_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_testimonial(
    test_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_admin),
):
    """Delete testimonial."""
    item = db.query(Testimonial).filter(Testimonial.id == test_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Testimonial not found")
    db.delete(item)
    db.commit()
    return None


# -----------------------------------------------------------------------------
# Contact Messages Management
# -----------------------------------------------------------------------------
@router.get("/messages", response_model=List[ContactMessageResponse])
def admin_list_messages(
    read: Optional[bool] = Query(None, description="Filter by read status"),
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_admin),
):
    """List contact form inquiries with optional read filter."""
    query = db.query(ContactMessage)
    if read is not None:
        query = query.filter(ContactMessage.read == read)
    return query.order_by(ContactMessage.created_at.desc()).all()


@router.put("/messages/{message_id}/read", response_model=ContactMessageResponse)
def admin_mark_message_read(
    message_id: int,
    update_data: Optional[ContactMessageUpdate] = None,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_admin),
):
    """Mark a contact message as read or update its read status."""
    message = db.query(ContactMessage).filter(ContactMessage.id == message_id).first()
    if not message:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")

    if update_data is not None and update_data.read is not None:
        message.read = update_data.read
    else:
        message.read = True

    db.commit()
    db.refresh(message)
    return message


@router.delete("/messages/{message_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_message(
    message_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_admin),
):
    """Delete a contact message."""
    message = db.query(ContactMessage).filter(ContactMessage.id == message_id).first()
    if not message:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")
    db.delete(message)
    db.commit()
    return None


# -----------------------------------------------------------------------------
# File Uploads (Resume & Images)
# -----------------------------------------------------------------------------
@router.post("/upload/resume", response_model=FileUploadResponse)
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_admin),
):
    """Upload resume PDF document, validate MIME type & size, and optionally update profile."""
    filename = file.filename or "resume.pdf"
    ext = os.path.splitext(filename)[1].lower()

    if ext != ".pdf" and file.content_type != "application/pdf":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF documents are allowed for resume upload",
        )

    # Read and validate size
    content = await file.read()
    size = len(content)
    if size > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE // (1024 * 1024)} MB",
        )

    # Ensure upload directory
    upload_dir = os.path.join(settings.UPLOAD_DIR, "resumes")
    os.makedirs(upload_dir, exist_ok=True)

    unique_filename = f"mukesh_pramanik_resume_{uuid.uuid4().hex[:8]}.pdf"
    filepath = os.path.join(upload_dir, unique_filename)

    async with aiofiles.open(filepath, "wb") as f:
        await f.write(content)

    public_url = f"/uploads/resumes/{unique_filename}"

    # Auto-update profile resume URL
    profile = db.query(Profile).first()
    if profile:
        profile.resume_url = public_url
        db.commit()

    return FileUploadResponse(
        filename=unique_filename,
        url=public_url,
        size=size,
        content_type=file.content_type or "application/pdf",
    )


@router.post("/upload/image", response_model=FileUploadResponse)
async def upload_image(
    file: UploadFile = File(...),
    current_admin: Admin = Depends(require_admin),
):
    """Upload project images, avatars, and cover assets."""
    allowed_extensions = {".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif"}
    filename = file.filename or "upload.png"
    ext = os.path.splitext(filename)[1].lower()

    if ext not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported image format. Allowed: {', '.join(allowed_extensions)}",
        )

    content = await file.read()
    size = len(content)
    if size > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File exceeds maximum size of {settings.MAX_UPLOAD_SIZE // (1024 * 1024)} MB",
        )

    upload_dir = os.path.join(settings.UPLOAD_DIR, "images")
    os.makedirs(upload_dir, exist_ok=True)

    unique_filename = f"img_{uuid.uuid4().hex[:12]}{ext}"
    filepath = os.path.join(upload_dir, unique_filename)

    async with aiofiles.open(filepath, "wb") as f:
        await f.write(content)

    public_url = f"/uploads/images/{unique_filename}"

    return FileUploadResponse(
        filename=unique_filename,
        url=public_url,
        size=size,
        content_type=file.content_type or "image/png",
    )


# -----------------------------------------------------------------------------
# Analytics Reporting
# -----------------------------------------------------------------------------
@router.get("/analytics", response_model=AnalyticsSummary)
def admin_get_analytics(
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_admin),
):
    """Retrieve detailed analytics statistics including page views and visits by date."""
    total_views = db.query(Analytics).count()
    unique_visitors = (
        db.query(func.count(func.distinct(Analytics.ip_address))).scalar() or 0
    )

    # Views grouped by page
    page_stats_query = (
        db.query(Analytics.page, func.count(Analytics.id).label("view_count"))
        .group_by(Analytics.page)
        .order_by(desc("view_count"))
        .limit(20)
        .all()
    )
    views_by_page = [PageViewStat(page=row[0], views=row[1]) for row in page_stats_query]

    # Daily views - works in both Postgres and SQLite via date formatting
    date_col = func.date(Analytics.created_at)
    daily_stats_query = (
        db.query(date_col.label("visit_date"), func.count(Analytics.id).label("day_count"))
        .group_by(date_col)
        .order_by(desc("visit_date"))
        .limit(30)
        .all()
    )
    views_by_day = [
        DailyViewStat(date=str(row[0]), views=row[1]) for row in daily_stats_query
    ]

    return AnalyticsSummary(
        total_views=total_views,
        unique_visitors=unique_visitors,
        views_by_page=views_by_page,
        views_by_day=views_by_day,
    )
