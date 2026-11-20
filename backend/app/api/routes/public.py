from datetime import datetime
from typing import Any, Dict, List, Optional, Union
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy import or_, desc, asc, func
from sqlalchemy.orm import Session

from app.api.deps import get_db, limiter
from app.models.models import (
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
    ProfileResponse,
    ProjectResponse,
    SkillResponse,
    SkillCategoryGroup,
    EducationResponse,
    ExperienceResponse,
    CertificationResponse,
    AchievementResponse,
    BlogPostResponse,
    TestimonialResponse,
    ContactForm,
    ContactMessageResponse,
    AnalyticsCreate,
    AnalyticsResponse,
    SearchResponse,
    SearchResultItem,
)

router = APIRouter(tags=["public"])


# -----------------------------------------------------------------------------
# Profile
# -----------------------------------------------------------------------------
@router.get("/profile", response_model=ProfileResponse)
def get_profile(db: Session = Depends(get_db)):
    """Fetch the main public profile for Mukesh Pramanik."""
    profile = db.query(Profile).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile has not been initialized yet",
        )
    return profile


# -----------------------------------------------------------------------------
# Projects
# -----------------------------------------------------------------------------
@router.get("/projects", response_model=List[ProjectResponse])
def get_projects(
    category: Optional[str] = Query(None, description="Filter by category"),
    featured: Optional[bool] = Query(None, description="Filter featured projects"),
    search: Optional[str] = Query(None, description="Search by title, description or tech"),
    db: Session = Depends(get_db),
):
    """List portfolio projects with optional filtering by category, featured status, or search term."""
    query = db.query(Project)

    if category:
        query = query.filter(Project.category.ilike(f"%{category}%"))

    if featured is not None:
        query = query.filter(Project.featured == featured)

    if search:
        search_filter = or_(
            Project.title.ilike(f"%{search}%"),
            Project.description.ilike(f"%{search}%"),
            Project.long_description.ilike(f"%{search}%"),
            Project.category.ilike(f"%{search}%"),
            func.cast(Project.technologies, func.TEXT).ilike(f"%{search}%"),
        )
        query = query.filter(search_filter)

    return query.order_by(Project.display_order.asc(), Project.created_at.desc()).all()


@router.get("/projects/{slug}", response_model=ProjectResponse)
def get_project_by_slug(slug: str, db: Session = Depends(get_db)):
    """Retrieve detailed project information by its unique slug."""
    project = db.query(Project).filter(Project.slug == slug).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with slug '{slug}' not found",
        )
    return project


# -----------------------------------------------------------------------------
# Skills
# -----------------------------------------------------------------------------
@router.get("/skills", response_model=Union[List[SkillResponse], List[SkillCategoryGroup]])
def get_skills(
    grouped: bool = Query(False, description="Whether to group skills by category"),
    category: Optional[str] = Query(None, description="Filter skills by category name"),
    db: Session = Depends(get_db),
):
    """Retrieve skills, optionally filtered by category or grouped by category."""
    query = db.query(Skill)
    if category:
        query = query.filter(Skill.category.ilike(f"%{category}%"))

    skills = query.order_by(Skill.category.asc(), Skill.display_order.asc(), Skill.proficiency.desc()).all()

    if grouped:
        grouped_dict: Dict[str, List[SkillResponse]] = {}
        for skill in skills:
            grouped_dict.setdefault(skill.category, []).append(SkillResponse.model_validate(skill))
        return [SkillCategoryGroup(category=cat, skills=items) for cat, items in grouped_dict.items()]

    return skills


# -----------------------------------------------------------------------------
# Education
# -----------------------------------------------------------------------------
@router.get("/education", response_model=List[EducationResponse])
def get_education(db: Session = Depends(get_db)):
    """Retrieve educational qualifications ordered by display priority and year."""
    return db.query(Education).order_by(Education.display_order.asc(), Education.start_year.desc()).all()


# -----------------------------------------------------------------------------
# Experience
# -----------------------------------------------------------------------------
@router.get("/experience", response_model=List[ExperienceResponse])
def get_experience(db: Session = Depends(get_db)):
    """Retrieve professional and internship experiences."""
    return db.query(Experience).order_by(Experience.display_order.asc(), Experience.current.desc()).all()


# -----------------------------------------------------------------------------
# Certifications
# -----------------------------------------------------------------------------
@router.get("/certifications", response_model=List[CertificationResponse])
def get_certifications(db: Session = Depends(get_db)):
    """Retrieve professional certifications and licenses."""
    return db.query(Certification).order_by(Certification.display_order.asc()).all()


# -----------------------------------------------------------------------------
# Achievements
# -----------------------------------------------------------------------------
@router.get("/achievements", response_model=List[AchievementResponse])
def get_achievements(db: Session = Depends(get_db)):
    """Retrieve honors, awards, and milestones."""
    return db.query(Achievement).order_by(Achievement.display_order.asc()).all()


# -----------------------------------------------------------------------------
# Blog
# -----------------------------------------------------------------------------
@router.get("/blog", response_model=List[BlogPostResponse])
def get_blog_posts(
    tag: Optional[str] = Query(None, description="Filter posts by tag"),
    search: Optional[str] = Query(None, description="Search in blog titles and content"),
    db: Session = Depends(get_db),
):
    """Retrieve published blog posts with optional tag filtering and text search."""
    query = db.query(BlogPost).filter(BlogPost.published == True)  # noqa: E712

    if tag:
        query = query.filter(func.cast(BlogPost.tags, func.TEXT).ilike(f"%{tag}%"))

    if search:
        search_filter = or_(
            BlogPost.title.ilike(f"%{search}%"),
            BlogPost.excerpt.ilike(f"%{search}%"),
            BlogPost.content.ilike(f"%{search}%"),
        )
        query = query.filter(search_filter)

    return query.order_by(BlogPost.published_at.desc(), BlogPost.created_at.desc()).all()


@router.get("/blog/{slug}", response_model=BlogPostResponse)
def get_blog_post_by_slug(slug: str, db: Session = Depends(get_db)):
    """Retrieve a single published blog post by its URL slug."""
    post = db.query(BlogPost).filter(BlogPost.slug == slug, BlogPost.published == True).first()  # noqa: E712
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Blog article '{slug}' not found or has not been published yet",
        )
    return post


# -----------------------------------------------------------------------------
# Testimonials
# -----------------------------------------------------------------------------
@router.get("/testimonials", response_model=List[TestimonialResponse])
def get_testimonials(db: Session = Depends(get_db)):
    """Retrieve visible endorsements and testimonials."""
    return (
        db.query(Testimonial)
        .filter(Testimonial.visible == True)  # noqa: E712
        .order_by(Testimonial.display_order.asc())
        .all()
    )


# -----------------------------------------------------------------------------
# Contact Form
# -----------------------------------------------------------------------------
@router.post("/contact", response_model=ContactMessageResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
def submit_contact(
    request: Request,
    contact_data: ContactForm,
    db: Session = Depends(get_db),
):
    """Submit a message via the portfolio contact form with rate limiting applied."""
    message = ContactMessage(
        name=contact_data.name.strip(),
        email=str(contact_data.email).strip().lower(),
        subject=contact_data.subject.strip(),
        message=contact_data.message.strip(),
        read=False,
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    return message


# -----------------------------------------------------------------------------
# Analytics
# -----------------------------------------------------------------------------
@router.post("/analytics", response_model=AnalyticsResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("60/minute")
def track_analytics(
    request: Request,
    data: AnalyticsCreate,
    db: Session = Depends(get_db),
):
    """Record an anonymous page view or telemetry event."""
    # Determine IP address taking reverse proxies into account
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        client_ip = forwarded.split(",")[0].strip()
    else:
        client_ip = request.client.host if request.client else None

    # Determine referrer and user agent from request if not provided
    referrer = data.referrer or request.headers.get("referer")
    user_agent = data.user_agent or request.headers.get("user-agent")

    record = Analytics(
        page=data.page.strip(),
        event=data.event.strip(),
        referrer=referrer[:500] if referrer else None,
        user_agent=user_agent[:500] if user_agent else None,
        ip_address=client_ip[:100] if client_ip else None,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


# -----------------------------------------------------------------------------
# Global Search
# -----------------------------------------------------------------------------
@router.get("/search", response_model=SearchResponse)
def global_search(
    q: str = Query(..., min_length=1, max_length=100, description="Search query string"),
    db: Session = Depends(get_db),
):
    """Perform multi-entity search across projects, blog posts, and skills."""
    search_term = q.strip()
    results: List[SearchResultItem] = []

    # Search Projects
    project_matches = (
        db.query(Project)
        .filter(
            or_(
                Project.title.ilike(f"%{search_term}%"),
                Project.description.ilike(f"%{search_term}%"),
                Project.category.ilike(f"%{search_term}%"),
                func.cast(Project.technologies, func.TEXT).ilike(f"%{search_term}%"),
            )
        )
        .limit(10)
        .all()
    )
    for p in project_matches:
        results.append(
            SearchResultItem(
                type="project",
                id=p.id,
                title=p.title,
                subtitle=p.category,
                description=p.description[:200] if p.description else None,
                slug=p.slug,
                category=p.category,
                url=f"/projects/{p.slug}",
            )
        )

    # Search Blog Posts (published only)
    blog_matches = (
        db.query(BlogPost)
        .filter(
            BlogPost.published == True,  # noqa: E712
            or_(
                BlogPost.title.ilike(f"%{search_term}%"),
                BlogPost.excerpt.ilike(f"%{search_term}%"),
                BlogPost.content.ilike(f"%{search_term}%"),
            ),
        )
        .limit(10)
        .all()
    )
    for b in blog_matches:
        results.append(
            SearchResultItem(
                type="blog",
                id=b.id,
                title=b.title,
                subtitle="Article",
                description=b.excerpt or b.content[:200],
                slug=b.slug,
                url=f"/blog/{b.slug}",
            )
        )

    # Search Skills
    skill_matches = (
        db.query(Skill)
        .filter(
            or_(
                Skill.name.ilike(f"%{search_term}%"),
                Skill.category.ilike(f"%{search_term}%"),
            )
        )
        .limit(10)
        .all()
    )
    for s in skill_matches:
        results.append(
            SearchResultItem(
                type="skill",
                id=s.id,
                title=s.name,
                subtitle=f"{s.category} ({s.proficiency}%)",
                description=f"Proficiency: {s.proficiency}% in {s.category}",
                category=s.category,
                url="/#skills",
            )
        )

    return SearchResponse(query=search_term, total=len(results), results=results)
