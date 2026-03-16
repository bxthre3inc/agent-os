import { useState, useEffect } from 'react'
import { X, Clock, Calendar, Target, AlertCircle } from 'lucide-react'

export default function AgentDetail({ agent, onClose }) {
  const [schedule, setSchedule] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/aos/schedule/${agent.name.toLowerCase()}`)
      .then(r => r.json())
      .then(data => {
        setSchedule(data)
        setLoading(false)
      })
      .catch(() => {
        setSchedule({
          daily: {
            "08:00": "Review overnight system status",
            "09:00": "Check dependencies from other agents",
            "10:00": "Primary work block (2 hours)",
            "12:00": "Lunch + async catch-up",
            "13:00": "Collaboration meetings",
            "15:00": "Secondary work block",
            "17:00": "Update status + handoffs"
          },
          weekly: ["Complete API docs", "Review 3 proposals", "Update roadmap"],
          monthly: ["Quarterly planning", "Performance review", "Skill upgrade"]
        })
        setLoading(false)
      })
  }, [agent])

  if (loading) return <div className="p-8 text-center">Loading schedule...</div>

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-lg border border-zinc-700 w-full max-w-2xl max-h-[90vh] overflow-auto m-4">
        <div className="p-6 border-b border-zinc-700 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-xl font-bold">
              {agent.name[0]}
            </div>
            <div>
              <h2 className="text-xl font-bold">{agent.name}</h2>
              <p className="text-zinc-400">{agent.role}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
              <Clock className="w-5 h-5 text-blue-400" />
              Today's Schedule
            </h3>
            <div className="space-y-2">
              {Object.entries(schedule?.daily || {}).map(([time, task]) => (
                <div key={time} className="flex items-start gap-4 p-3 bg-zinc-800 rounded">
                  <span className="text-zinc-500 font-mono w-16">{time}</span>
                  <span>{task}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="flex items-center gap-2 text-lg font-semibold mb-3">
                <Calendar className="w-5 h-5 text-green-400" />
                This Week
              </h3>
              <ul className="space-y-2">
                {(schedule?.weekly || []).map((task, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    {task}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="flex items-center gap-2 text-lg font-semibold mb-3">
                <Target className="w-5 h-5 text-purple-400" />
                This Month
              </h3>
              <ul className="space-y-2">
                {(schedule?.monthly || []).map((task, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                    {task}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded">
            <h3 className="flex items-center gap-2 font-semibold text-yellow-400 mb-2">
              <AlertCircle className="w-5 h-5" />
              Current Dependencies
            </h3>
            <p className="text-sm text-zinc-300">
              Waiting on: Alex for tech specs (2 hours overdue)
            </p>
            <p className="text-sm text-zinc-300">
              Blocking: Drew needs API approval
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
