import { useState, useEffect } from 'react'
import { DragDropContext } from 'react-beautiful-dnd'
import { 
  Shield, Activity, FileText, Play, AlertTriangle, 
  Check, X, Settings, Users, FileDiff, AlertCircle,
  Clock, Calendar, Target, GripVertical, Wifi, WifiOff
} from 'lucide-react'
import AgentDetail from './components/AgentDetail'
import DepartmentDetail from './components/DepartmentDetail'
import TaskBoard from './components/TaskBoard'
import { useRealtime } from './hooks/useRealtime'

const API_BASE = 'https://brodiblanco.zo.space/api/aos'

const agents = [
  { id: 'erica', name: 'Erica', role: 'Executive Briefing', status: 'active', tasks: 2, dept: 'Executive' },
  { id: 'pulse', name: 'Pulse', role: 'System Monitor', status: 'active', tasks: 0, dept: 'Monitoring' },
  { id: 'sentinel', name: 'Sentinel', role: 'Security Watch', status: 'active', tasks: 1, dept: 'Security' },
  { id: 'alex', name: 'Alex', role: 'Documentation', status: 'idle', tasks: 0, dept: 'Content' },
  { id: 'drew', name: 'Drew', role: 'Engineering', status: 'active', tasks: 3, dept: 'Engineering' },
  { id: 'casey', name: 'Casey', role: 'Grants', status: 'active', tasks: 1, dept: 'Grants' }
]

const departments = [
  { id: 'engineering', name: 'Engineering', head: 'Maya', progress: 65 },
  { id: 'operations', name: 'Operations', head: 'Raj', progress: 42 },
  { id: 'grants', name: 'Grants & Finance', head: 'Sam', progress: 78 },
  { id: 'content', name: 'Content', head: 'Alex', progress: 30 }
]

const strategicPillars = [
  { name: 'Farm Operations', objective: '10,000 sensors by Q3', priority: 'P0', progress: 35 },
  { name: 'Funding', objective: '$2M grants + $5M seed', priority: 'P0', progress: 60 },
  { name: 'Technology', objective: 'Production-ready v1.0', priority: 'P1', progress: 65 },
  { name: 'IP', objective: '5 patents filed', priority: 'P1', progress: 40 },
  { name: 'Starting 5 Product', objective: '$10K MRR', priority: 'P2', progress: 15 }
]

export default function App() {
  const [trainingWheels, setTrainingWheels] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [proposals, setProposals] = useState([])
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [selectedDept, setSelectedDept] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const { connected, updates } = useRealtime()

  useEffect(() => {
    setProposals([
      { id: 'PROP-001', agent: 'Alex', title: 'Fix typo in README', risk: 2, status: 'pending', file: 'README.md' },
      { id: 'PROP-002', agent: 'Sentinel', title: 'Update dev secrets warning', risk: 15, status: 'pending', file: 'start-with-env.sh' },
      { id: 'PROP-003', agent: 'Drew', title: 'Add API rate limiting', risk: 25, status: 'pending', file: 'api/middleware.ts' }
    ])
  }, [])

  const handleProposalAction = (proposalId, action) => {
    setProposals(proposals.map(p => p.id === proposalId ? { ...p, status: action } : p))
    setMessage(`✅ Proposal ${action}d`)
    setTimeout(() => setMessage(''), 3000)
  }

  const handleReassign = (taskId, from, to) => {
    console.log(`Reassigned ${taskId} from ${from} to ${to}`)
  }

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm">
        <span className={connected ? 'text-green-400' : 'text-red-400'}>
          {connected ? <Wifi className="w-4 h-4 inline" /> : <WifiOff className="w-4 h-4 inline" />}
        </span>
        <span className="text-zinc-400">{connected ? 'Realtime connected' : 'Offline mode'}</span>
        {updates.length > 0 && (
          <span className="text-blue-400">• {updates.length} new updates</span>
        )}
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatBox label="Active Agents" value={agents.filter(a => a.status === 'active').length} color="#4ade80" />
        <StatBox label="Pending Proposals" value={proposals.filter(p => p.status === 'pending').length} color="#fbbf24" />
        <StatBox label="Blocked Tasks" value={2} color="#ef4444" />
        <StatBox label="Safe Auto-Exec" value={proposals.filter(p => p.risk <= 15).length} color="#a78bfa" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <SafetyCard trainingWheels={trainingWheels} onToggle={() => setTrainingWheels(!trainingWheels)} />
        <QuickActionsCard pendingCount={proposals.filter(p => p.status === 'pending').length} onReview={() => setActiveTab('proposals')} />
      </div>

      {updates.length > 0 && (
        <div className="bg-zinc-900 rounded-lg border border-zinc-700 p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            Live Updates
          </h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {updates.slice(0, 5).map((update, i) => (
              <div key={i} className="text-sm p-2 bg-zinc-800 rounded flex items-center gap-2">
                <span className="text-zinc-500">{new Date(update.timestamp).toLocaleTimeString()}</span>
                <span className={update.type === 'success' ? 'text-green-400' : update.type === 'warning' ? 'text-yellow-400' : 'text-blue-400'}>
                  {update.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const renderAgents = () => (
    <div className="space-y-4">
      <p className="text-zinc-400 text-sm">Click any agent to see their daily schedule, weekly goals, and dependencies</p>
      <div className="grid grid-cols-2 gap-4">
        {agents.map(agent => (
          <div 
            key={agent.id} 
            onClick={() => setSelectedAgent(agent)}
            className="bg-zinc-900 p-4 rounded-lg border border-zinc-700 cursor-pointer hover:border-blue-500 transition"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold">
                  {agent.name[0]}
                </div>
                <div>
                  <div className="font-semibold">{agent.name}</div>
                  <div className="text-sm text-zinc-400">{agent.role}</div>
                </div>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 rounded text-xs ${agent.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-zinc-700 text-zinc-400'}`}>
                  {agent.status}
                </span>
                <div className="text-sm text-zinc-500 mt-1">{agent.tasks} tasks</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderRoadmap = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3">Strategic Pillars</h3>
        <div className="space-y-3">
          {strategicPillars.map(pillar => (
            <div key={pillar.name} className="bg-zinc-900 p-4 rounded-lg border border-zinc-700">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${pillar.priority === 'P0' ? 'bg-red-500/20 text-red-400' : pillar.priority === 'P1' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-zinc-700 text-zinc-400'}`}>
                    {pillar.priority}
                  </span>
                  <span className="font-semibold">{pillar.name}</span>
                </div>
                <span className="text-sm text-zinc-400">{pillar.progress}%</span>
              </div>
              <p className="text-sm text-zinc-400 mb-2">{pillar.objective}</p>
              <div className="w-full bg-zinc-800 h-2 rounded">
                <div className="bg-blue-500 h-2 rounded transition-all" style={{ width: `${pillar.progress}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Departments</h3>
        <p className="text-zinc-400 text-sm mb-3">Click department to see quarterly OKRs, team, and budget</p>
        <div className="grid grid-cols-2 gap-4">
          {departments.map(dept => (
            <div 
              key={dept.id} 
              onClick={() => setSelectedDept(dept)}
              className="bg-zinc-900 p-4 rounded-lg border border-zinc-700 cursor-pointer hover:border-blue-500 transition"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">{dept.name}</span>
                <span className="text-sm text-zinc-400">{dept.progress}%</span>
              </div>
              <p className="text-sm text-zinc-400 mb-2">Head: {dept.head}</p>
              <div className="w-full bg-zinc-800 h-2 rounded">
                <div className="bg-green-500 h-2 rounded" style={{ width: `${dept.progress}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderProposals = () => (
    <div className="space-y-4">
      <p className="text-zinc-400 text-sm">Review and approve agent proposals. High-risk items require manual approval.</p>
      {proposals.map(prop => (
        <div key={prop.id} className="bg-zinc-900 p-4 rounded-lg border border-zinc-700">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="font-semibold">{prop.title}</div>
              <div className="text-sm text-zinc-400">{prop.agent} • {prop.file}</div>
            </div>
            <span className={`px-2 py-1 rounded text-xs ${prop.status === 'approved' ? 'bg-green-500/20 text-green-400' : prop.status === 'rejected' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
              {prop.status}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className={`text-sm ${prop.risk <= 15 ? 'text-green-400' : prop.risk <= 30 ? 'text-yellow-400' : 'text-red-400'}`}>
              Risk: {prop.risk}/100
            </span>
            {prop.status === 'pending' && (
              <div className="flex gap-2">
                <button 
                  onClick={() => handleProposalAction(prop.id, 'approve')}
                  className="px-4 py-2 bg-green-500 text-black rounded hover:bg-green-400 transition"
                >
                  Approve
                </button>
                <button 
                  onClick={() => handleProposalAction(prop.id, 'reject')}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-400 transition"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )

  const renderTasks = () => (
    <DragDropContext>
      <TaskBoard onReassign={handleReassign} />
    </DragDropContext>
  )

  const renderSettings = () => (
    <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-700">
      <h3 className="text-xl font-semibold mb-6">System Settings</h3>
      
      <div className="mb-6">
        <label className="block text-zinc-400 mb-2">Training Wheels Mode</label>
        <div className="flex gap-3">
          <button 
            onClick={() => setTrainingWheels(true)}
            className={`px-6 py-3 rounded ${trainingWheels ? 'bg-green-500 text-black' : 'bg-zinc-800 text-white'}`}
          >
            ON (Safe)
          </button>
          <button 
            onClick={() => setTrainingWheels(false)}
            className={`px-6 py-3 rounded ${!trainingWheels ? 'bg-red-500 text-white' : 'bg-zinc-800 text-white'}`}
          >
            OFF (Live)
          </button>
        </div>
        <p className="text-sm text-zinc-400 mt-2">
          {trainingWheels ? 'Agents simulate changes. No files modified without approval.' : 'Full autonomy. Agents execute approved actions immediately.'}
        </p>
      </div>

      <div className="p-4 bg-zinc-800 rounded">
        <h4 className="font-semibold mb-2">Protected Resources (Always Active)</h4>
        <ul className="text-sm text-zinc-400 space-y-1">
          <li>• .env files — Require manual approval</li>
          <li>• *.secret.* — Require manual approval</li>
          <li>• Deploy scripts — Require manual approval</li>
          <li>• *.pem, *.key — Require manual approval</li>
        </ul>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto p-6">
        <header className="flex items-center justify-between mb-8 pb-6 border-b border-zinc-800">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Activity className="w-8 h-8 text-blue-500" />
              Agent OS Control Center
            </h1>
            <p className="text-zinc-400 mt-1">
              Dashboard-First Interface • {connected ? 'Realtime Active' : 'Offline Mode'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className={`px-3 py-1 rounded text-sm font-semibold ${trainingWheels ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
              {trainingWheels ? '⚠️ Training Wheels' : '✅ Full Autonomy'}
            </span>
          </div>
        </header>

        {message && (
          <div className="mb-6 p-4 bg-green-500/20 text-green-400 rounded-lg">
            {message}
          </div>
        )}

        <nav className="flex gap-2 mb-8">
          {['overview', 'agents', 'roadmap', 'tasks', 'proposals', 'settings'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg capitalize transition ${
                activeTab === tab ? 'bg-blue-500 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>

        <main>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'agents' && renderAgents()}
          {activeTab === 'roadmap' && renderRoadmap()}
          {activeTab === 'tasks' && renderTasks()}
          {activeTab === 'proposals' && renderProposals()}
          {activeTab === 'settings' && renderSettings()}
        </main>
      </div>

      {selectedAgent && (
        <AgentDetail agent={selectedAgent} onClose={() => setSelectedAgent(null)} />
      )}

      {selectedDept && (
        <DepartmentDetail dept={selectedDept} onClose={() => setSelectedDept(null)} />
      )}
    </div>
  )
}

function StatBox({ label, value, color }) {
  return (
    <div className="bg-zinc-900 p-5 rounded-lg border border-zinc-700">
      <div className="text-zinc-400 text-sm mb-1">{label}</div>
      <div className="text-4xl font-bold" style={{ color }}>{value}</div>
    </div>
  )
}

function SafetyCard({ trainingWheels, onToggle }) {
  return (
    <div className="bg-zinc-900 p-5 rounded-lg border border-zinc-700">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-blue-400" />
        <h3 className="font-semibold">Safety Status</h3>
      </div>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-zinc-400">Training Wheels</span>
          <span className={trainingWheels ? 'text-green-400' : 'text-red-400'}>
            {trainingWheels ? 'ON' : 'OFF'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-400">Risk Threshold</span>
          <span className="text-blue-400">≤15</span>
        </div>
        <button 
          onClick={onToggle}
          className="w-full mt-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded transition text-sm"
        >
          Toggle Safety Mode
        </button>
      </div>
    </div>
  )
}

function QuickActionsCard({ pendingCount, onReview }) {
  return (
    <div className="bg-zinc-900 p-5 rounded-lg border border-zinc-700">
      <div className="flex items-center gap-2 mb-4">
        <Play className="w-5 h-5 text-green-400" />
        <h3 className="font-semibold">Quick Actions</h3>
      </div>
      <div className="space-y-2">
        <button className="w-full py-2 bg-blue-500 hover:bg-blue-400 text-white rounded transition">
          Trigger Sprint
        </button>
        <button 
          onClick={onReview}
          className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded transition"
        >
          Review Proposals ({pendingCount})
        </button>
      </div>
    </div>
  )
}
