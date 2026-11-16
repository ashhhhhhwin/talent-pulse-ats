SKILL_ALIASES = {
    "react": ["reactjs", "react.js", "react js"],
    "node.js": ["node", "nodejs", "node js"],
    "postgresql": ["postgres", "psql"],
    "javascript": ["js", "ecmascript"],
    "typescript": ["ts"],
    "amazon web services": ["aws"],
    "kubernetes": ["k8s"],
    "continuous integration": ["ci/cd", "cicd"],
}

CANONICAL_SKILLS = [
    "React", "Node.js", "Express", "TypeScript", "JavaScript", "Python", "SQL",
    "PostgreSQL", "MongoDB", "Docker", "AWS", "Kubernetes", "Tailwind CSS",
    "Redux", "Jest", "REST APIs", "GraphQL", "Next.js", "Terraform", "CI/CD",
    "Java", "Spring Boot", "Tableau", "Power BI", "Excel", "Statistics",
    "Kafka", "Redis", "Linux", "Helm", "Prometheus", "Grafana", "HRIS",
    "Workday", "Communication", "Talent Management",
]


def normalize_skill(skill: str) -> str:
    s = skill.strip().lower()
    for canonical, aliases in SKILL_ALIASES.items():
        if s == canonical or s in aliases:
            return canonical
    return s


def normalize_skills(skills: list[str]) -> list[str]:
    seen = set()
    out = []
    for skill in skills:
        norm = normalize_skill(skill)
        if norm not in seen:
            seen.add(norm)
            out.append(norm)
    return out
