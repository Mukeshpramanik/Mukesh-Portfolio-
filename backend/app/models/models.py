from datetime import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Boolean,
    Float,
    DateTime,
    JSON,
    func,
)
from app.core.database import Base


class Admin(Base):
    """Admin credentials model for authenticating portfolio administration."""

    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class Profile(Base):
    """Owner profile details, tagline, biography, and social links."""

    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    tagline = Column(String(255), nullable=True)
    bio = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)
    resume_url = Column(String(500), nullable=True)
    social_links = Column(JSON, default=dict, nullable=False)
    email = Column(String(255), nullable=True)
    location = Column(String(150), nullable=True)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class Project(Base):
    """Showcase projects with metadata, technologies, and repositories."""

    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=False)
    long_description = Column(Text, nullable=True)
    category = Column(String(100), nullable=False, index=True)
    technologies = Column(JSON, default=list, nullable=False)
    github_url = Column(String(500), nullable=True)
    live_url = Column(String(500), nullable=True)
    image_url = Column(String(500), nullable=True)
    featured = Column(Boolean, default=False, nullable=False, index=True)
    display_order = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class Skill(Base):
    """Technical and professional skills with category and proficiency."""

    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    category = Column(String(100), nullable=False, index=True)
    proficiency = Column(Integer, default=0, nullable=False)  # 0 to 100
    icon = Column(String(100), nullable=True)
    display_order = Column(Integer, default=0, nullable=False)


class Education(Base):
    """Academic qualifications and degrees."""

    __tablename__ = "education"

    id = Column(Integer, primary_key=True, index=True)
    institution = Column(String(255), nullable=False)
    degree = Column(String(255), nullable=False)
    field = Column(String(255), nullable=True)
    start_year = Column(String(50), nullable=False)
    end_year = Column(String(50), nullable=True)
    gpa = Column(Float, nullable=True)
    description = Column(Text, nullable=True)
    display_order = Column(Integer, default=0, nullable=False)


class Experience(Base):
    """Professional work experience, internships, and roles."""

    __tablename__ = "experiences"

    id = Column(Integer, primary_key=True, index=True)
    company = Column(String(255), nullable=False)
    role = Column(String(255), nullable=False)
    type = Column(String(100), nullable=True)  # e.g., Full-time, Internship, Freelance
    start_date = Column(String(100), nullable=False)
    end_date = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    technologies = Column(JSON, default=list, nullable=False)
    current = Column(Boolean, default=False, nullable=False)
    display_order = Column(Integer, default=0, nullable=False)


class Certification(Base):
    """Certificates and professional credentials."""

    __tablename__ = "certifications"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    issuer = Column(String(255), nullable=False)
    date = Column(String(100), nullable=True)
    credential_url = Column(String(500), nullable=True)
    image_url = Column(String(500), nullable=True)
    display_order = Column(Integer, default=0, nullable=False)


class Achievement(Base):
    """Honors, awards, and notable achievements."""

    __tablename__ = "achievements"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    date = Column(String(100), nullable=True)
    category = Column(String(100), nullable=True)
    display_order = Column(Integer, default=0, nullable=False)


class BlogPost(Base):
    """Articles, blogs, and tutorials."""

    __tablename__ = "blog_posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    excerpt = Column(Text, nullable=True)
    content = Column(Text, nullable=False)
    cover_image = Column(String(500), nullable=True)
    tags = Column(JSON, default=list, nullable=False)
    published = Column(Boolean, default=False, nullable=False, index=True)
    published_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class Testimonial(Base):
    """Recommendations, peer feedback, and client testimonials."""

    __tablename__ = "testimonials"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    role = Column(String(255), nullable=False)
    company = Column(String(255), nullable=True)
    content = Column(Text, nullable=False)
    avatar_url = Column(String(500), nullable=True)
    visible = Column(Boolean, default=True, nullable=False, index=True)
    display_order = Column(Integer, default=0, nullable=False)


class ContactMessage(Base):
    """Inquiries and messages sent through the portfolio contact form."""

    __tablename__ = "contact_messages"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    subject = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    read = Column(Boolean, default=False, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class Analytics(Base):
    """Page view tracking and visitor telemetry."""

    __tablename__ = "analytics"

    id = Column(Integer, primary_key=True, index=True)
    page = Column(String(255), nullable=False, index=True)
    event = Column(String(100), default="pageview", nullable=False)
    referrer = Column(String(500), nullable=True)
    user_agent = Column(String(500), nullable=True)
    ip_address = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
