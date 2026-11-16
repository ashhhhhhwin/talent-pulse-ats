function normalize(list = []) {
  return list.map((s) => s.toLowerCase().trim()).filter(Boolean)
}

function jaccard(a, b) {
  const setA = new Set(a)
  const setB = new Set(b)
  if (setA.size === 0 && setB.size === 0) return 0
  let intersection = 0
  setA.forEach((item) => {
    if (setB.has(item)) intersection += 1
  })
  const union = new Set([...setA, ...setB]).size
  return union === 0 ? 0 : intersection / union
}

function experienceFit(candidateYears, jobExperience) {
  const match = jobExperience.match(/(\d+)\s*-\s*(\d+)/)
  if (!match) return 0.7
  const min = Number(match[1])
  const max = Number(match[2])
  if (candidateYears >= min && candidateYears <= max) return 1
  if (candidateYears >= min - 1 && candidateYears <= max + 1) return 0.75
  if (candidateYears < min - 2 || candidateYears > max + 3) return 0.35
  return 0.55
}

function originalCasing(skillLower, sourceList) {
  return sourceList.find((s) => s.toLowerCase() === skillLower) || skillLower
}

export function scoreCandidateForJob(candidate, job) {
  const candidateSkills = normalize(candidate.skills)
  const required = normalize(job.requiredSkills)
  const preferred = normalize(job.preferredSkills)

  const requiredMatches = required.filter((s) => candidateSkills.includes(s))
  const preferredMatches = preferred.filter((s) => candidateSkills.includes(s))

  const requiredScore = required.length ? requiredMatches.length / required.length : 0
  const preferredScore = preferred.length ? preferredMatches.length / preferred.length : 0
  const overlapScore = jaccard(candidateSkills, [...required, ...preferred])
  const expScore = experienceFit(candidate.experienceYears, job.experience)

  const score =
    requiredScore * 0.55 + preferredScore * 0.15 + overlapScore * 0.15 + expScore * 0.15

  return {
    score: Math.round(score * 100),
    requiredMatches: requiredMatches.map((s) => originalCasing(s, job.requiredSkills)),
    preferredMatches: preferredMatches.map((s) => originalCasing(s, job.preferredSkills)),
    missingRequired: required
      .filter((s) => !candidateSkills.includes(s))
      .map((s) => originalCasing(s, job.requiredSkills)),
  }
}

export function getBestJobMatch(candidate, jobs) {
  const ranked = jobs
    .map((job) => ({
      job,
      ...scoreCandidateForJob(candidate, job),
    }))
    .sort((a, b) => b.score - a.score)

  return {
    best: ranked[0],
    all: ranked,
  }
}

export function scoreLabel(score) {
  if (score >= 85) return { label: 'Excellent', tone: 'text-emerald-700 bg-emerald-50 border-emerald-200' }
  if (score >= 70) return { label: 'Strong', tone: 'text-indigo-700 bg-indigo-50 border-indigo-200' }
  if (score >= 55) return { label: 'Moderate', tone: 'text-amber-700 bg-amber-50 border-amber-200' }
  return { label: 'Low', tone: 'text-rose-700 bg-rose-50 border-rose-200' }
}
