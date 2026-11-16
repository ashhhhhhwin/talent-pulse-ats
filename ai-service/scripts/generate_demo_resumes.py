"""Generate sample resumes for Smart Recruiter manager demo."""
from pathlib import Path
from docx import Document

OUT = Path(__file__).resolve().parent.parent.parent / "demo-resumes"
OUT.mkdir(exist_ok=True)

RESUMES = [
    {
        "file": "01_Priya_Sharma_Senior_Frontend.docx",
        "name": "Priya Sharma",
        "email": "priya.sharma.demo@email.com",
        "phone": "+91 98765 11101",
        "title": "Senior Frontend Engineer",
        "years": 6,
        "location": "Bengaluru, India",
        "summary": (
            "Senior frontend engineer with 6 years building React design systems, "
            "TypeScript applications, and accessible UI at scale."
        ),
        "skills": "React, TypeScript, Tailwind CSS, Redux, Jest, REST APIs, Next.js, GraphQL, Storybook",
        "experience": (
            "TechNova Solutions | Senior Frontend Engineer | 2021 – Present\n"
            "- Led React + TypeScript migration for customer portal (500K users)\n"
            "- Built component library with Storybook and Jest test coverage\n"
            "- Collaborated with design on Tailwind CSS design tokens\n\n"
            "FlipWeb Labs | Frontend Developer | 2019 – 2021\n"
            "- Developed Redux state management and REST API integrations"
        ),
        "education": "B.Tech Computer Science — IIT Roorkee | 2018",
    },
    {
        "file": "02_Rahul_Verma_Backend_Node.docx",
        "name": "Rahul Verma",
        "email": "rahul.verma.demo@email.com",
        "phone": "+91 98111 22203",
        "title": "Backend Engineer",
        "years": 5,
        "location": "Hyderabad, India",
        "summary": (
            "Backend engineer specializing in Node.js microservices, Express APIs, "
            "MongoDB, PostgreSQL, and AWS cloud deployments."
        ),
        "skills": "Node.js, Express, MongoDB, PostgreSQL, Docker, AWS, Redis, Kubernetes, REST APIs",
        "experience": (
            "CloudPay Systems | Backend Engineer | 2020 – Present\n"
            "- Built Node.js + Express payment APIs handling 2M requests/day\n"
            "- Deployed services on AWS with Docker and Kubernetes\n"
            "- Designed PostgreSQL schemas and MongoDB document stores\n\n"
            "StartupHub | Software Engineer | 2018 – 2020\n"
            "- Implemented Redis caching and Kafka event streaming"
        ),
        "education": "B.E. Information Technology — JNTU Hyderabad | 2018",
    },
    {
        "file": "03_Ananya_Nair_Data_Analyst.docx",
        "name": "Ananya Nair",
        "email": "ananya.nair.demo@email.com",
        "phone": "+91 99001 33304",
        "title": "Data Analyst",
        "years": 3,
        "location": "Pune, India",
        "summary": (
            "Data analyst with strong SQL, Python, Tableau, and Power BI skills. "
            "Experienced in A/B testing and product analytics."
        ),
        "skills": "SQL, Python, Tableau, Excel, Statistics, Power BI, A/B Testing, dbt, Looker",
        "experience": (
            "Insight Analytics Pvt Ltd | Data Analyst | 2022 – Present\n"
            "- Built Tableau dashboards for product and ops teams\n"
            "- Wrote SQL queries and Python scripts for cohort analysis\n"
            "- Ran A/B tests and reported results to stakeholders\n\n"
            "RetailMetrics | Junior Analyst | 2021 – 2022\n"
            "- Excel reporting and Power BI visualizations"
        ),
        "education": "M.Sc. Statistics — Pune University | 2021",
    },
    {
        "file": "04_Karthik_Iyer_Junior_Developer.docx",
        "name": "Karthik Iyer",
        "email": "karthik.iyer.demo@email.com",
        "phone": "+91 97654 44405",
        "title": "Junior Full Stack Developer",
        "years": 2,
        "location": "Chennai, India",
        "summary": (
            "Early-career developer with JavaScript, React, and Node.js project experience. "
            "Seeking frontend-focused growth opportunities."
        ),
        "skills": "JavaScript, React, HTML, CSS, Node.js, MongoDB, Git",
        "experience": (
            "Freelance Projects | Junior Developer | 2023 – Present\n"
            "- Built small React apps and personal portfolio projects\n"
            "- Basic Node.js + MongoDB CRUD applications\n\n"
            "Internship — CodeStart | Web Dev Intern | 2022 – 2023"
        ),
        "education": "B.Tech CSE — Anna University | 2022",
    },
    {
        "file": "05_Sneha_Patel_DevOps.docx",
        "name": "Sneha Patel",
        "email": "sneha.patel.demo@email.com",
        "phone": "+91 98220 55506",
        "title": "DevOps / Cloud Engineer",
        "years": 4,
        "location": "Bengaluru, India",
        "summary": (
            "DevOps engineer with AWS, Docker, Kubernetes, Terraform, and CI/CD pipeline expertise."
        ),
        "skills": "AWS, Docker, Kubernetes, Terraform, CI/CD, Linux, Prometheus, Grafana, Python",
        "experience": (
            "InfraCore Technologies | Cloud Engineer | 2021 – Present\n"
            "- Managed Kubernetes clusters and Terraform infrastructure\n"
            "- Built CI/CD pipelines and monitoring with Prometheus/Grafana\n\n"
            "SysOps India | Associate Engineer | 2020 – 2021"
        ),
        "education": "B.Tech ECE — NIT Surat | 2020",
    },
    {
        "file": "06_Meera_Krishnan_FullStack_Strong.docx",
        "name": "Meera Krishnan",
        "email": "meera.k.demo@email.com",
        "phone": "+91 98860 66607",
        "title": "Senior Full Stack Engineer",
        "years": 7,
        "location": "Bengaluru, India",
        "summary": (
            "Full stack engineer with React, Node.js, TypeScript, PostgreSQL, Docker, and AWS. "
            "Strong match for both frontend and backend roles."
        ),
        "skills": "React, TypeScript, Node.js, Express, PostgreSQL, MongoDB, Docker, AWS, Redux, Jest, REST APIs",
        "experience": (
            "Enterprise Apps Ltd | Senior Full Stack Engineer | 2019 – Present\n"
            "- React + Node.js platform serving enterprise HR clients\n"
            "- PostgreSQL database design and Express REST APIs\n"
            "- Dockerized deployments on AWS\n\n"
            "WebCraft | Software Engineer | 2017 – 2019"
        ),
        "education": "B.E. CSE — PES University | 2017",
    },
]


def build_resume(data: dict) -> None:
    doc = Document()
    doc.add_heading(data["name"], 0)
    doc.add_paragraph(f'{data["phone"]} | {data["email"]} | {data["location"]}')
    doc.add_paragraph(f'{data["years"]} years of experience')
    doc.add_heading("Professional Summary", level=1)
    doc.add_paragraph(data["summary"])
    doc.add_heading("Skills", level=1)
    doc.add_paragraph(data["skills"])
    doc.add_heading("Experience", level=1)
    doc.add_paragraph(data["experience"])
    doc.add_heading("Education", level=1)
    doc.add_paragraph(data["education"])
    path = OUT / data["file"]
    doc.save(path)
    print(f"Created: {path.name}")


if __name__ == "__main__":
    for r in RESUMES:
        build_resume(r)
    print(f"\nDone — {len(RESUMES)} resumes in: {OUT}")
