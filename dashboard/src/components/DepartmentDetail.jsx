import { useState, useEffect } from 'react'
import { X, Target, Users, TrendingUp, Calendar } from 'lucide-react'

export default function DepartmentDetail({ dept, onClose }) {
  const [goals, setGoals] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/aos/department/${dept.id}`)
      .then(r => r.json())
      .then(data => {
        setGoals(data)
        setLoading(false)
      })
      .catch(() => {
        setGoals({
          q1: {
            objective: "Complete Oracle integration + API stability",
            progress: 65,
            krs: [
              { name: "Oracle 99.9% uptime", current: 98.5, target: 99.9 },
              { name: "API <100ms p95", current: 120, target: 100 },
              { name: "Zero P0 bugs", current: 1, target: 0 }
            ]
          },
          q2: {
            objective: "Field hardware deployment infrastructure",
            progress: 20,
            krs: [
              { name: "LRZ provisioning live", done: false },
              { name: "Health monitoring dashboard", done: false },
              { name: "Auto-rollback system", done: false }
            ]
          },
          team: ["Drew", "Theo", "Maya"],
          budget: "$450K allocated, $120K spent"
        })
        setLoading(false)
      })
  }, [dept])

  if (loading) return <div className="p-8 text-center">Loading department data...</div>

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-lg border border-zinc-700 w-full max-w-3xl max-h-[90vh] overflow-auto m-4">
        <div className="p-6 border-b border-zinc-700 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{dept.name}</h2>
            <p className="text-zinc-400">Head: {dept.head}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-zinc-800 rounded">
              <div className="flex items-center gap-2 text-zinc-400 mb-2">
                <Target className="w-4 h-4" />
                Q1 Progress
              </div>
              <div className="text-3xl font-bold text-blue-400">{goals?.q1?.progress || 0}%</div>
              <div className="w-full bg-zinc-700 h-2 rounded mt-2">
                <div className="bg-blue-400 h-2 rounded" style={{ width: `${goals?.q1?.progress || 0}%` }}></div>
              </div>
            </div>
            <div className="p-4 bg-zinc-800 rounded">
              <div className="flex items-center gap-2 text-zinc-400 mb-2">
                <Users className="w-4 h-4" />
                Team Size
              </div>
              <div className="text-3xl font-bold text-green-400">{goals?.team?.length || 0}</div>
              <div className="text-sm text-zinc-500 mt-1">{goals?.team?.join(", ")}</div>
            </div>
            <div className="p-4 bg-zinc-800 rounded">
              <div className="flex items-center gap-2 text-zinc-400 mb-2">
                <TrendingUp className="w-4 h-4" />
                Budget
              </div>
              <div className="text-3xl font-bold text-yellow-400">27%</div>
              <div className="text-sm text-zinc-500 mt-1">spent of Q1 allocation</div>
            </div>
          </div>

          <div>
            <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
              <Calendar className="w-5 h-5 text-blue-400" />
              Q1 2026: {goals?.q1?.objective}
            </h3>
            <div className="space-y-3">
              {goals?.q1?.krs?.map((kr, i) => (
                <div key={i} className="p-4 bg-zinc-800 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span>{kr.name}</span>
                    <span className={`font-mono ${kr.current >= kr.target ? 'text-green-400' : 'text-yellow-400'}`}>
                      {kr.current} / {kr.target}
                    </span>
                  </div>
                  <div className="w-full bg-zinc-700 h-2 rounded">
                    <div 
                      className={`h-2 rounded ${kr.current >= kr.target ? 'bg-green-400' : 'bg-yellow-400'}`}
                      style={{ width: `${Math.min(100, (kr.current / kr.target) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Q2 2026 Preview</h3>
            <p className="text-zinc-400 mb-3">{goals?.q2?.objective}</p>
            <div className="grid grid-cols-3 gap-3">
              {goals?.q2?.krs?.map((kr, i) => (
                <div key={i} className={`p-3 rounded text-center ${kr.done ? 'bg-green-500/20 text-green-400' : 'bg-zinc-800 text-zinc-500'}`}>
                  {kr.done ? '✓' : '○'} {kr.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
