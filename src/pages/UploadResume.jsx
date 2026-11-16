import { useState } from 'react'
import { FileUp, Loader2, CheckCircle2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { parseResumeFile } from '../utils/resumeParser'
import { getBestJobMatch } from '../utils/similarity'
import api from '../services/api'
import { useHR } from '../context/HRContext'
import ScoreBadge from '../components/ScoreBadge'
import JobCard from '../components/JobCard'

export default function UploadResume() {
  const { jobs, addCandidateFromResume, moveToPipeline, apiReady } = useHR()
  const navigate = useNavigate()
  const [dragging, setDragging] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [parsed, setParsed] = useState(null)
  const [matches, setMatches] = useState([])
  const [savedId, setSavedId] = useState(null)
  const [uploadedFile, setUploadedFile] = useState(null)

  const handleFile = async (file) => {
    if (!file) return
    setParsing(true)
    setSavedId(null)
    setUploadedFile(file)
    try {
      if (apiReady) {
        const result = await api.uploadResume(file)
        const created = result.candidate
        setParsed({
          name: created.name,
          email: created.email,
          phone: created.phone,
          location: created.location,
          experienceYears: created.experienceYears,
          education: created.education,
          currentTitle: created.currentTitle,
          summary: created.summary,
          skills: created.skills,
        })
        setMatches(
          (result.matches || []).map((m) => ({
            job: jobs.find((j) => j.id === String(m.jobId)) || { id: String(m.jobId), title: `Job #${m.jobId}` },
            score: Math.round(m.finalScore),
            requiredMatches: m.matchedSkills || [],
            missingRequired: m.missingSkills || [],
          })),
        )
        setSavedId(created.id)
      } else {
        const result = await parseResumeFile(file)
        const ranked = getBestJobMatch(result, jobs)
        setParsed(result)
        setMatches(ranked.all)
      }
    } finally {
      setParsing(false)
    }
  }

  const onInputChange = (e) => {
    const file = e.target.files?.[0]
    handleFile(file)
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    handleFile(file)
  }

  const saveCandidate = async (alsoPipeline = false) => {
    if (!parsed) return
    if (savedId && apiReady) {
      if (alsoPipeline) {
        await moveToPipeline(savedId)
        navigate('/pipeline')
      }
      return
    }
    const created = await addCandidateFromResume(parsed, uploadedFile)
    setSavedId(created.id)
    if (alsoPipeline) {
      await moveToPipeline(created.id)
      navigate('/pipeline')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Upload & parse resume</h2>
        <p className="mt-1 text-sm text-slate-500">
          Drop a PDF or DOCX file. The backend extracts skills via the Python AI service and scores every open role.
        </p>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`rounded-xl border-2 border-dashed p-10 text-center transition ${
          dragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 bg-white'
        }`}
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
          {parsing ? <Loader2 className="h-6 w-6 animate-spin" /> : <FileUp className="h-6 w-6" />}
        </div>
        <p className="mt-4 text-lg font-semibold text-slate-900">
          {parsing ? 'Parsing resume…' : 'Drag & drop resume here'}
        </p>
        <p className="mt-1 text-sm text-slate-500">or choose a file from your computer</p>
        <label className="mt-5 inline-flex cursor-pointer rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">
          Browse files
          <input type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" onChange={onInputChange} />
        </label>
        <p className="mt-3 text-xs text-slate-400">Tip: TXT resumes parse richest text; PDF/DOC use filename + skill heuristics.</p>
      </div>

      {parsed && (
        <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-indigo-600">Parsed profile</p>
                <h3 className="mt-1 text-2xl font-semibold text-slate-900">{parsed.name}</h3>
                <p className="text-sm text-slate-500">{parsed.currentTitle}</p>
              </div>
              {savedId && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Saved
                </span>
              )}
            </div>

            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-slate-400">Email</dt>
                <dd className="font-medium text-slate-800">{parsed.email}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Phone</dt>
                <dd className="font-medium text-slate-800">{parsed.phone}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Location</dt>
                <dd className="font-medium text-slate-800">{parsed.location}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Experience</dt>
                <dd className="font-medium text-slate-800">{parsed.experienceYears} years</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-slate-400">Education</dt>
                <dd className="font-medium text-slate-800">{parsed.education}</dd>
              </div>
            </dl>

            <p className="mt-4 text-sm leading-relaxed text-slate-600">{parsed.summary}</p>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {parsed.skills.map((skill) => (
                <span key={skill} className="rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700">
                  {skill}
                </span>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => saveCandidate(false)}
                disabled={!!savedId}
                className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Save to candidate pool
              </button>
              <button
                type="button"
                onClick={() => saveCandidate(true)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                Save & move to pipeline
              </button>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-900">Similarity against job listings</h3>
            {matches.map((m) => (
              <div key={m.job.id} className="relative">
                <JobCard job={m.job} matchScore={m.score} />
                <div className="mt-2 flex flex-wrap items-center gap-2 px-1 text-xs text-slate-500">
                  <ScoreBadge score={m.score} />
                  <span>
                    Matched: {m.requiredMatches.slice(0, 4).join(', ') || '—'}
                    {m.missingRequired.length > 0 && ` · Missing: ${m.missingRequired.slice(0, 3).join(', ')}`}
                  </span>
                </div>
              </div>
            ))}
          </section>
        </div>
      )}
    </div>
  )
}
