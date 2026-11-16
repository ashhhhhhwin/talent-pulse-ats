const SKILL_ALIASES = {
  reactjs: 'React',
  react: 'React',
  'react.js': 'React',
  typescript: 'TypeScript',
  ts: 'TypeScript',
  javascript: 'JavaScript',
  js: 'JavaScript',
  'node.js': 'Node.js',
  nodejs: 'Node.js',
  node: 'Node.js',
  expressjs: 'Express',
  express: 'Express',
  mongodb: 'MongoDB',
  postgres: 'PostgreSQL',
  postgresql: 'PostgreSQL',
  docker: 'Docker',
  kubernetes: 'AWS',
  k8s: 'Kubernetes',
  kubernetes: 'Kubernetes',
  terraform: 'Terraform',
  'ci/cd': 'CI/CD',
  cicd: 'CI/CD',
  linux: 'Linux',
  sql: 'SQL',
  python: 'Python',
  tableau: 'Tableau',
  excel: 'Excel',
  'power bi': 'Power BI',
  powerbi: 'Power BI',
  statistics: 'Statistics',
  redux: 'Redux',
  jest: 'Jest',
  'tailwind css': 'Tailwind CSS',
  tailwind: 'Tailwind CSS',
  'rest apis': 'REST APIs',
  rest: 'REST APIs',
  'next.js': 'Next.js',
  nextjs: 'Next.js',
  graphql: 'GraphQL',
  storybook: 'Storybook',
  redis: 'Redis',
  kafka: 'Kafka',
  prometheus: 'Prometheus',
  grafana: 'Grafana',
  helm: 'Helm',
  workday: 'Workday',
  hris: 'HRIS',
  'talent management': 'Talent Management',
  'employee relations': 'Employee Relations',
  'performance management': 'Performance Management',
  communication: 'Communication',
  coaching: 'Coaching',
  'change management': 'Change Management',
  dbt: 'dbt',
  looker: 'Looker',
  'a/b testing': 'A/B Testing',
  html: 'HTML',
  css: 'CSS',
}

const KNOWN_SKILLS = Object.values(SKILL_ALIASES)

const NAME_POOL = [
  'Aisha Khan',
  'Vikram Reddy',
  'Neha Gupta',
  'Siddharth Rao',
  'Ishita Bose',
  'Manish Verma',
  'Divya Menon',
  'Rahul Jain',
]

const TITLE_POOL = [
  'Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Engineer',
  'Data Analyst',
  'DevOps Engineer',
  'HR Specialist',
  'Product Analyst',
]

function normalizeSkill(token) {
  const key = token.trim().toLowerCase()
  return SKILL_ALIASES[key] || null
}

function extractSkillsFromText(text) {
  const found = new Set()
  const lower = text.toLowerCase()

  Object.entries(SKILL_ALIASES).forEach(([alias, skill]) => {
    const pattern = new RegExp(`(?:^|[^a-z0-9.+/#])${alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:$|[^a-z0-9.+/#])`, 'i')
    if (pattern.test(lower)) found.add(skill)
  })

  const skillSection = text.match(/skills?\s*[:\-]\s*([^\n]+)/i)
  if (skillSection?.[1]) {
    skillSection[1]
      .split(/[,|/•·]/)
      .map((s) => normalizeSkill(s) || s.trim())
      .filter((s) => s && s.length > 1 && s.length < 40)
      .forEach((s) => {
        const known = KNOWN_SKILLS.find((k) => k.toLowerCase() === s.toLowerCase())
        found.add(known || s)
      })
  }

  return [...found]
}

function extractEmail(text) {
  const match = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)
  return match?.[0] || null
}

function extractPhone(text) {
  const match = text.match(/(\+?\d[\d\s\-()]{8,}\d)/)
  return match?.[0]?.trim() || null
}

function extractYears(text) {
  const match = text.match(/(\d+)\+?\s*(?:\+|years?|yrs?)/i)
  return match ? Number(match[1]) : null
}

function extractNameFromFilename(fileName) {
  const base = fileName.replace(/\.[^.]+$/, '')
  const cleaned = base
    .replace(/[_-]+/g, ' ')
    .replace(/\b(resume|cv|curriculum|vitae)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
  if (cleaned.split(' ').length >= 2) return cleaned.replace(/\b\w/g, (c) => c.toUpperCase())
  return null
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}

function hashString(value) {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

function mockSkillsFromSeed(seed) {
  const pools = [
    ['React', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'Redux', 'Jest', 'REST APIs'],
    ['Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'Docker', 'AWS', 'Redis'],
    ['SQL', 'Python', 'Tableau', 'Excel', 'Statistics', 'Power BI'],
    ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'Linux'],
    ['Talent Management', 'Employee Relations', 'Performance Management', 'Communication', 'HRIS'],
  ]
  const pool = pools[seed % pools.length]
  return pool.slice(0, 4 + (seed % 3))
}

export async function parseResumeFile(file) {
  const text = await readFileAsText(file)
  const seed = hashString(file.name + file.size)

  let skills = extractSkillsFromText(text)
  if (skills.length < 3) {
    skills = [...new Set([...skills, ...mockSkillsFromSeed(seed)])]
  }

  const name =
    extractNameFromFilename(file.name) ||
    text.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})/m)?.[1] ||
    NAME_POOL[seed % NAME_POOL.length]

  const email = extractEmail(text) || `${name.toLowerCase().replace(/\s+/g, '.')}@email.com`
  const phone = extractPhone(text) || `+91 9${String(100000000 + (seed % 899999999)).slice(0, 9)}`
  const experienceYears = extractYears(text) ?? 2 + (seed % 6)
  const currentTitle = TITLE_POOL[seed % TITLE_POOL.length]

  return {
    name,
    email,
    phone,
    location: ['Bengaluru', 'Hyderabad', 'Pune', 'Mumbai', 'Chennai', 'Delhi NCR'][seed % 6],
    experienceYears,
    currentTitle,
    education: ['B.Tech Computer Science', 'B.E. Information Technology', 'MBA HR', 'M.Sc. Statistics'][seed % 4],
    skills,
    summary: `${currentTitle} with ${experienceYears} years of experience. Skills include ${skills.slice(0, 4).join(', ')}.`,
    resumeFileName: file.name,
    rawTextPreview: text.slice(0, 400) || `Mock-parsed content from ${file.name}`,
  }
}

function readFileAsText(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : ''
      // Binary PDFs/DOCX won't yield useful text — treat as empty and use filename heuristics.
      if (/[\u0000-\u0008]/.test(result.slice(0, 200)) || result.includes('%PDF')) {
        resolve('')
        return
      }
      resolve(result)
    }
    reader.onerror = () => resolve('')
    reader.readAsText(file)
  })
}
