/**
 * Seeds default admin user and sample jobs for development.
 * Run: npm run db:init (after executing database/schema.sql in SSMS)
 */
require('dotenv').config()
const bcrypt = require('bcryptjs')
const { getPool, query, closePool } = require('../src/config/database')

const SAMPLE_JOBS = [
  {
    title: 'Senior Frontend Engineer',
    description:
      'Build scalable React applications with strong UX focus. Own component systems, performance, and collaboration with design.',
    minimumExperience: 4,
    requiredSkills: ['React', 'TypeScript', 'Tailwind CSS', 'Redux', 'Jest', 'REST APIs'],
    preferredSkills: ['Next.js', 'GraphQL', 'Storybook'],
  },
  {
    title: 'Backend Engineer (Node.js)',
    description:
      'Design and maintain Node.js microservices, APIs, and data pipelines with emphasis on reliability and observability.',
    minimumExperience: 3,
    requiredSkills: ['Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'Docker', 'AWS'],
    preferredSkills: ['Kafka', 'Redis', 'Kubernetes'],
  },
  {
    title: 'Data Analyst',
    description:
      'Turn raw data into actionable insights using SQL, Python, and visualization tools for product and ops teams.',
    minimumExperience: 2,
    requiredSkills: ['SQL', 'Python', 'Tableau', 'Excel', 'Statistics', 'Power BI'],
    preferredSkills: ['dbt', 'Looker', 'A/B Testing'],
  },
]

async function seed() {
  await getPool()

  const role = await query(`SELECT RoleId FROM Roles WHERE RoleName = 'ADMIN'`)
  const roleId = role.recordset[0]?.RoleId || 1

  const existing = await query(`SELECT UserId FROM Users WHERE Email = @email`, {
    email: 'admin@smartrecruiter.local',
  })

  if (!existing.recordset.length) {
    const hash = await bcrypt.hash('Admin@123', 12)
    await query(
      `INSERT INTO Users (Name, Email, PasswordHash, RoleId) VALUES (@name, @email, @hash, @roleId)`,
      { name: 'System Admin', email: 'admin@smartrecruiter.local', hash, roleId },
    )
    console.log('Created admin user: admin@smartrecruiter.local / Admin@123')
  }

  for (const job of SAMPLE_JOBS) {
    const found = await query(`SELECT JobId FROM Jobs WHERE Title = @title`, { title: job.title })
    if (found.recordset.length) continue

    const inserted = await query(
      `INSERT INTO Jobs (Title, Description, MinimumExperience, Status)
       OUTPUT INSERTED.JobId VALUES (@title, @description, @minExp, 'Open')`,
      { title: job.title, description: job.description, minExp: job.minimumExperience },
    )
    const jobId = inserted.recordset[0].JobId

    for (const s of job.requiredSkills) {
      await query(
        `INSERT INTO JobSkills (JobId, SkillName, SkillNormalized, IsMandatory) VALUES (@jobId, @name, @norm, 1)`,
        { jobId, name: s, norm: s.toLowerCase() },
      )
    }
    for (const s of job.preferredSkills) {
      await query(
        `INSERT INTO JobSkills (JobId, SkillName, SkillNormalized, IsMandatory) VALUES (@jobId, @name, @norm, 0)`,
        { jobId, name: s, norm: s.toLowerCase() },
      )
    }
    console.log(`Seeded job: ${job.title}`)
  }

  await closePool()
  console.log('Database seed complete.')
}

seed().catch((err) => {
  console.error('Seed failed:', err.message)
  process.exit(1)
})
