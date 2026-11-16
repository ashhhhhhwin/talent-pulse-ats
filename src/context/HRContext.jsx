import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { CANDIDATES, JOBS, PIPELINE_STAGES } from '../data/mockData'
import api from '../services/api'

const HRContext = createContext(null)
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export function HRProvider({ children }) {
  const [jobs, setJobs] = useState(USE_MOCK ? JOBS : [])
  const [candidates, setCandidates] = useState(USE_MOCK ? CANDIDATES : [])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(!USE_MOCK)
  const [apiReady, setApiReady] = useState(USE_MOCK)
  const [toast, setToast] = useState(null)

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() })
    window.setTimeout(() => setToast(null), 2800)
  }, [])

  const refreshData = useCallback(async () => {
    if (USE_MOCK) return
    try {
      const [jobsData, candidatesData, statsData] = await Promise.all([
        api.getJobs(),
        api.getCandidates(),
        api.getDashboardStats(),
      ])
      setJobs(jobsData)
      setCandidates(candidatesData)
      setStats(statsData)
      setApiReady(true)
    } catch (err) {
      console.warn('API unavailable, falling back to mock data', err.message)
      setJobs(JOBS)
      setCandidates(CANDIDATES)
      setApiReady(false)
      showToast(err.message || 'Backend API unavailable — showing demo data', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    if (USE_MOCK) return

    async function bootstrap() {
      const fallbackTimer = window.setTimeout(() => {
        setJobs(JOBS)
        setCandidates(CANDIDATES)
        setApiReady(false)
        setLoading(false)
        showToast('Backend slow — showing demo data. Run START_VIVA.bat', 'error')
      }, 10000)

      try {
        if (!api.getToken()) {
          await api.login('admin@smartrecruiter.local', 'Admin@123')
        }
        await refreshData()
      } catch {
        setJobs(JOBS)
        setCandidates(CANDIDATES)
        setApiReady(false)
        setLoading(false)
      } finally {
        window.clearTimeout(fallbackTimer)
      }
    }
    bootstrap()
  }, [refreshData])

  const computedStats = useMemo(() => {
    if (stats && apiReady) {
      return {
        totalCandidates: stats.totalCandidates,
        openJobs: stats.openJobs,
        inPipeline: stats.inPipeline,
        offers: stats.offers,
        hired: stats.hired,
        avgScore: stats.avgScore,
      }
    }
    const inPipeline = candidates.filter((c) => c.pipelineStage && c.pipelineStage !== 'hired').length
    const offers = candidates.filter((c) => c.offer?.status === 'released' || c.pipelineStage === 'offer').length
    const hired = candidates.filter((c) => c.pipelineStage === 'hired' || c.status === 'hired').length
    const avgScore = candidates.length
      ? Math.round(candidates.reduce((sum, c) => sum + (c.similarityScore || 0), 0) / candidates.length)
      : 0
    return {
      totalCandidates: candidates.length,
      openJobs: jobs.filter((j) => j.status === 'Open').length,
      inPipeline,
      offers,
      hired,
      avgScore,
    }
  }, [candidates, jobs, stats, apiReady])

  const addCandidateFromResume = useCallback(
    async (parsed, file = null) => {
      if (apiReady && file) {
        try {
          const result = await api.uploadResume(file)
          const created = result.candidate
          setCandidates((prev) => [created, ...prev.filter((c) => c.id !== created.id)])
          await refreshData()
          showToast(`${created.name} uploaded — ${created.similarityScore}% best match`)
          return created
        } catch (err) {
          showToast(err.message || 'Upload failed', 'error')
          throw err
        }
      }

      const { getBestJobMatch } = await import('../utils/similarity')
      const match = getBestJobMatch(parsed, jobs)
      const newCandidate = {
        id: `cand-${Date.now()}`,
        ...parsed,
        matchedJobId: match.best.job.id,
        similarityScore: match.best.score,
        status: 'matched',
        pipelineStage: null,
        notes: '',
        uploadedAt: new Date().toISOString().slice(0, 10),
        matchDetails: match.all,
      }
      setCandidates((prev) => [newCandidate, ...prev])
      showToast(`${parsed.name} uploaded — best match ${match.best.score}% for ${match.best.job.title}`)
      return newCandidate
    },
    [apiReady, jobs, refreshData, showToast],
  )

  const moveToPipeline = useCallback(
    async (candidateId, stage = 'screening') => {
      const numericId = String(candidateId).replace(/\D/g, '')
      if (apiReady && numericId) {
        try {
          await api.updateCandidateStage(numericId, stage)
          await refreshData()
          showToast('Candidate moved to interview pipeline')
          return
        } catch (err) {
          showToast(err.message || 'Failed to update pipeline', 'error')
        }
      }
      setCandidates((prev) =>
        prev.map((c) =>
          c.id === candidateId ? { ...c, status: 'in_pipeline', pipelineStage: stage } : c,
        ),
      )
      showToast('Candidate moved to interview pipeline')
    },
    [apiReady, refreshData, showToast],
  )

  const updatePipelineStage = useCallback(
    async (candidateId, stage) => {
      const numericId = String(candidateId).replace(/\D/g, '')
      if (apiReady && numericId) {
        try {
          await api.updateCandidateStage(numericId, stage)
          await refreshData()
          return
        } catch (err) {
          showToast(err.message || 'Stage update failed', 'error')
        }
      }
      setCandidates((prev) =>
        prev.map((c) => {
          if (c.id !== candidateId) return c
          const next = {
            ...c,
            status: stage === 'hired' ? 'hired' : 'in_pipeline',
            pipelineStage: stage,
          }
          if (stage === 'offer' && !c.offer) {
            next.offer = { salary: 'Suggesting package…', joiningDate: '', status: 'draft' }
          }
          return next
        }),
      )
    },
    [apiReady, refreshData, showToast],
  )

  const releaseOffer = useCallback(
    (candidateId, offer) => {
      setCandidates((prev) =>
        prev.map((c) =>
          c.id === candidateId
            ? {
                ...c,
                status: 'offer_released',
                pipelineStage: 'offer',
                offer: { ...offer, status: 'released', releasedAt: new Date().toISOString().slice(0, 10) },
              }
            : c,
        ),
      )
      showToast('Offer released to candidate')
    },
    [showToast],
  )

  const markHired = useCallback(
    (candidateId) => {
      updatePipelineStage(candidateId, 'hired')
      showToast('Candidate marked as hired')
    },
    [updatePipelineStage, showToast],
  )

  const updateNotes = useCallback(
    async (candidateId, notes) => {
      const numericId = String(candidateId).replace(/\D/g, '')
      if (apiReady && numericId) {
        try {
          await api.updateCandidateNotes(numericId, notes)
        } catch {
          /* keep local state */
        }
      }
      setCandidates((prev) => prev.map((c) => (c.id === candidateId ? { ...c, notes } : c)))
    },
    [apiReady],
  )

  const value = {
    jobs,
    candidates,
    stages: PIPELINE_STAGES,
    toast,
    stats: computedStats,
    loading,
    apiReady,
    addCandidateFromResume,
    moveToPipeline,
    updatePipelineStage,
    releaseOffer,
    markHired,
    updateNotes,
    showToast,
    refreshData,
  }

  return <HRContext.Provider value={value}>{children}</HRContext.Provider>
}

export function useHR() {
  const ctx = useContext(HRContext)
  if (!ctx) throw new Error('useHR must be used within HRProvider')
  return ctx
}
