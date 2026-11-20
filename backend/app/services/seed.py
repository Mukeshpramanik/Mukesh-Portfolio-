import logging
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import get_password_hash
from app.models.models import (
    Admin,
    Profile,
    Project,
    Skill,
    Education,
)

logger = logging.getLogger(__name__)


def seed_admin_user(db: Session) -> None:
    """Create initial default admin account if not present."""
    existing_admin = db.query(Admin).filter(Admin.username == settings.ADMIN_USERNAME).first()
    if not existing_admin:
        logger.info(f"Creating default admin account '{settings.ADMIN_USERNAME}'...")
        admin = Admin(
            username=settings.ADMIN_USERNAME,
            hashed_password=get_password_hash(settings.ADMIN_PASSWORD),
        )
        db.add(admin)
        db.commit()
        logger.info("Admin account successfully created.")


def seed_profile_data(db: Session) -> None:
    """Seed Mukesh Pramanik's profile details if profile table is empty."""
    if db.query(Profile).first() is not None:
        return

    logger.info("Seeding initial profile for Mukesh Pramanik...")
    profile = Profile(
        name="Mukesh Pramanik",
        tagline="B.Tech CSE Student | Data Analytics Enthusiast | Python Developer",
        bio=(
            "A passionate Computer Science Engineering student (2023-2027) with strong "
            "interests in Data Analytics, Python programming, AI/ML, and Software Development. "
            "Dedicated to building meaningful projects and continuously learning new technologies."
        ),
        summary=(
            "Aspiring software developer and data analyst with hands-on experience in Python, "
            "SQL, and data visualization tools. Currently pursuing B.Tech in Computer Science "
            "Engineering with a focus on practical project-based learning."
        ),
        email="mukeshpramanik.dev@gmail.com",
        location="India",
        social_links={
            "github": "https://github.com/Mukeshpramanik",
            "linkedin": "",
            "twitter": "",
            "email": "mukeshpramanik.dev@gmail.com",
            "website": "",
        },
    )
    db.add(profile)
    db.commit()
    logger.info("Profile data seeded successfully.")


def seed_skills(db: Session) -> None:
    """Seed technical skills categorized with realistic proficiency percentages."""
    if db.query(Skill).first() is not None:
        return

    logger.info("Seeding technical skills...")
    skills_data = [
        # Programming
        {"name": "Python", "category": "Programming", "proficiency": 90, "icon": "python", "display_order": 1},
        {"name": "SQL", "category": "Programming", "proficiency": 85, "icon": "database", "display_order": 2},
        # Data Analysis
        {"name": "Pandas", "category": "Data Analysis", "proficiency": 80, "icon": "chart-bar", "display_order": 3},
        {"name": "Data Analysis", "category": "Data Analysis", "proficiency": 80, "icon": "table", "display_order": 4},
        {"name": "NumPy", "category": "Data Analysis", "proficiency": 75, "icon": "cpu", "display_order": 5},
        {"name": "Matplotlib", "category": "Data Analysis", "proficiency": 70, "icon": "pie-chart", "display_order": 6},
        # Web Development
        {"name": "HTML", "category": "Web Development", "proficiency": 85, "icon": "code", "display_order": 7},
        {"name": "CSS", "category": "Web Development", "proficiency": 80, "icon": "palette", "display_order": 8},
        {"name": "JavaScript", "category": "Web Development", "proficiency": 60, "icon": "terminal", "display_order": 9},
        # Tools
        {"name": "Excel", "category": "Tools", "proficiency": 85, "icon": "file-spreadsheet", "display_order": 10},
        {"name": "Power BI", "category": "Tools", "proficiency": 75, "icon": "bar-chart-2", "display_order": 11},
        {"name": "Git", "category": "Tools", "proficiency": 70, "icon": "git-branch", "display_order": 12},
    ]

    for item in skills_data:
        skill = Skill(**item)
        db.add(skill)

    db.commit()
    logger.info(f"Seeded {len(skills_data)} skills.")


def seed_projects(db: Session) -> None:
    """Seed initial projects with descriptions and GitHub repository links."""
    if db.query(Project).first() is not None:
        return

    logger.info("Seeding portfolio projects...")
    projects_data = [
        {
            "title": "Studexa – Students Database CRUD Application",
            "slug": "studexa-students-database-crud-application",
            "description": "A full-stack database management application for student records. Built with Python, features Create, Read, Update, Delete operations.",
            "long_description": (
                "Studexa is a comprehensive student record management system designed to streamline academic data administration. "
                "Built using Python and relational database concepts, it enables educators and administrative staff to easily create, "
                "read, update, and remove student profiles, academic marks, and contact records with full transactional integrity."
            ),
            "category": "Web Development",
            "technologies": ["Python", "SQL", "Database", "CRUD"],
            "github_url": "https://github.com/Mukeshpramanik",
            "live_url": None,
            "image_url": None,
            "featured": True,
            "display_order": 1,
        },
        {
            "title": "Heart Disease Prediction",
            "slug": "heart-disease-prediction",
            "description": "Machine learning model to predict heart disease using patient health data. Implements classification algorithms for accurate diagnosis prediction.",
            "long_description": (
                "An end-to-end predictive healthcare analytics system that analyzes clinical indicators such as blood pressure, "
                "cholesterol levels, and electrocardiogram results to evaluate cardiovascular risk. The project utilizes Scikit-learn "
                "classification pipelines alongside comprehensive feature engineering to optimize predictive accuracy."
            ),
            "category": "AI/ML",
            "technologies": ["Python", "Pandas", "Scikit-learn", "Machine Learning"],
            "github_url": "https://github.com/Mukeshpramanik",
            "live_url": None,
            "image_url": None,
            "featured": True,
            "display_order": 2,
        },
        {
            "title": "Data Visualization Dashboard",
            "slug": "data-visualization-dashboard",
            "description": "Interactive data visualization project creating insightful charts and dashboards from complex datasets.",
            "long_description": (
                "A dynamic analytics dashboard transforming raw corporate metrics into actionable visual intelligence. "
                "Leverages Python, Matplotlib, and statistical summaries to uncover trends, outliers, and distribution curves."
            ),
            "category": "Data Analysis",
            "technologies": ["Python", "Matplotlib", "Pandas", "Data Visualization"],
            "github_url": "https://github.com/Mukeshpramanik",
            "live_url": None,
            "image_url": None,
            "featured": True,
            "display_order": 3,
        },
        {
            "title": "Exploratory Data Analysis",
            "slug": "exploratory-data-analysis",
            "description": "Comprehensive EDA project analyzing datasets to uncover patterns, trends, and insights using statistical methods.",
            "long_description": (
                "In-depth exploratory data analysis framework exploring multidimensional distributions, correlation matrices, "
                "and hypothesis testing to guide data cleaning and predictive modeling workflows."
            ),
            "category": "Data Analysis",
            "technologies": ["Python", "Pandas", "NumPy", "Statistics"],
            "github_url": "https://github.com/Mukeshpramanik",
            "live_url": None,
            "image_url": None,
            "featured": False,
            "display_order": 4,
        },
        {
            "title": "Web Scraping Tool",
            "slug": "web-scraping-tool",
            "description": "Automated web scraping tool to extract and process data from websites.",
            "long_description": (
                "Resilient web crawler and data extraction pipeline utilizing BeautifulSoup and Requests. "
                "Automates data harvesting, cleans raw HTML structures, and persists structured records for downstream analysis."
            ),
            "category": "Automation",
            "technologies": ["Python", "BeautifulSoup", "Requests", "Data Processing"],
            "github_url": "https://github.com/Mukeshpramanik",
            "live_url": None,
            "image_url": None,
            "featured": False,
            "display_order": 5,
        },
    ]

    for item in projects_data:
        project = Project(**item)
        db.add(project)

    db.commit()
    logger.info(f"Seeded {len(projects_data)} projects.")


def seed_education(db: Session) -> None:
    """Seed academic degree information."""
    if db.query(Education).first() is not None:
        return

    logger.info("Seeding academic background...")
    edu = Education(
        institution="Engineering College / University",
        degree="B.Tech in Computer Science Engineering",
        field="Computer Science and Engineering",
        start_year="2023",
        end_year="2027",
        gpa=None,
        description=(
            "Focusing on core computer science foundations, algorithms, data structures, "
            "database systems, and statistical data analytics."
        ),
        display_order=1,
    )
    db.add(edu)
    db.commit()
    logger.info("Education record seeded.")


# NOTE: Experience, Certifications, Achievements, and Testimonials tables
# are intentionally left unseeded without fake data as instructed.
# Mukesh can populate them dynamically via the Admin dashboard.


def seed_all(db: Session) -> None:
    """Run complete database seeding sequence."""
    seed_admin_user(db)
    seed_profile_data(db)
    seed_skills(db)
    seed_projects(db)
    seed_education(db)
