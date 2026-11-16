import { useEffect, useRef, useState } from 'react'
import { X, Send, Loader2, Sparkles, ExternalLink, UserRound } from 'lucide-react'
import api from '../services/api'

const STARTER_PROMPTS = [
  'Find React developers with 5+ years experience in Bengaluru',
  'Search for Node.js backend engineers open to remote work',
  'Find data analysts skilled in Python and SQL on LinkedIn',
]

function getInitialMessages() {
  return [
    {
      role: 'assistant',
      content:
        'I search the web for candidate profiles only. Ask me to find people by skill, role, experience, or location.',
      candidates: [],
      sources: [],
    },
  ]
}

function WebCandidateCard({ candidate }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
          <UserRound className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-900">{candidate.name}</p>
          {candidate.title && <p className="text-xs text-slate-500">{candidate.title}</p>}
          {candidate.location && <p className="mt-0.5 text-xs text-slate-400">{candidate.location}</p>}
          {candidate.summary && (
            <p className="mt-2 text-xs leading-relaxed text-slate-600">{candidate.summary}</p>
          )}
          {candidate.skills?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {candidate.skills.slice(0, 6).map((skill) => (
                <span
                  key={skill}
                  className="rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
          {candidate.profile_url && (
            <a
              href={candidate.profile_url}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700"
            >
              View profile <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
    </article>
  )
}

export default function AssistantChat({ open, onClose }) {
  const [messages, setMessages] = useState(getInitialMessages)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const bottomRef = useRef(null)

  const handleClose = () => {
    setMessages(getInitialMessages())
    setInput('')
    setError(null)
    setLoading(false)
    onClose()
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const sendMessage = async (text) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    setError(null)
    // Fresh session each time panel is opened — only use history within current open session
    const history = messages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .slice(1)
      .map((m) => ({ role: m.role, content: m.content }))

    setMessages((prev) => [...prev, { role: 'user', content: trimmed }])
    setInput('')
    setLoading(true)

    try {
      const data = await api.assistantChat(trimmed, history)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.answer,
          candidates: data.candidates || [],
          sources: data.sources || [],
        },
      ])
    } catch (err) {
      setError(err.message || 'Assistant request failed')
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I could not complete that search. Check that GOOGLE_API_KEY and TAVILY_API_KEY are set in the ai-service .env.',
          candidates: [],
          sources: [],
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-[1px]">
      <aside className="flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">AI Sourcing Assistant</h2>
              <p className="text-xs text-slate-500">Candidate web search only</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close assistant"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
          {messages.map((msg, idx) => (
            <div key={`${msg.role}-${idx}`} className={msg.role === 'user' ? 'flex justify-end' : ''}>
              <div
                className={`max-w-[92%] rounded-2xl px-3 py-2.5 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'border border-slate-200 bg-slate-50 text-slate-800'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>

              {msg.role === 'assistant' && msg.candidates?.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Profiles found ({msg.candidates.length})
                  </p>
                  {msg.candidates.map((c, i) => (
                    <WebCandidateCard key={`${c.name}-${i}`} candidate={c} />
                  ))}
                </div>
              )}

              {msg.role === 'assistant' && msg.sources?.length > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-[11px] font-medium text-slate-500">Sources</p>
                  {msg.sources.slice(0, 4).map((s) => (
                    <a
                      key={s.url}
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block truncate text-[11px] text-indigo-600 hover:underline"
                    >
                      {s.url}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching the web for candidates…
            </div>
          )}
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-slate-200 px-4 py-3">
          <div className="mb-2 flex flex-wrap gap-1.5">
            {STARTER_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => sendMessage(prompt)}
                disabled={loading}
                className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 disabled:opacity-50"
              >
                {prompt.length > 42 ? `${prompt.slice(0, 42)}…` : prompt}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              sendMessage(input)
            }}
            className="flex items-end gap-2"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={2}
              placeholder="Find senior React engineers in Mumbai…"
              className="flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </form>
        </div>
      </aside>
    </div>
  )
}
