import { useState, useEffect } from 'react'
import { Shield, Layers, Grid, Settings, Users, Activity, Play, Pause, RotateCw, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

export default function AdminSection() {
  const [projects, setProjects] = useState([])
  const [selectedProjects, setSelectedProjects] = useState([])
  const [viewMode, setViewMode] = useState('grid') // grid | list | groups
  const [actionMenu, setActionMenu] = useState(null)
  const [bulkAction, setBulkAction] = useState(null)
  
  // Project groups for bulk operations
  const [groups, setGroups] = useState([
    { id: 'all', name: 'All Projects', projects: ['*'] },
    { id: 'farmsense', name: 'FarmSense Suite', projects: ['farmsense-main', 'farmsense-oracle', 'farmsense-mobile'] },
    { id: 'starting5', name: 'Starting 5', projects: ['starting5-backend', 'starting5-web'] },
    { id: 'agents', name: 'Agent OS Only', projects: ['agent-os-core'] },
    { id: 'production', name: 'Production', projects: ['farmsense-main', 'starting5-backend'] },
    { id: 'staging', name: 'Staging/Dev', projects: ['farmsense-staging', 'starting5-dev'] }
  ])

  useEffect(() => {
    // Load all projects from all systems
    loadAllProjects()
  }, [])

  const loadAllProjects = async () => {
    // This would fetch from FarmSense API, Starting 5 API, Agent OS internal
    const allProjects = [
      // FarmSense Projects
      {
        id: 'farmsense-main',
        name: 'FarmSense Core',
        platform: 'FarmSense',
        type: 'backend',
        status: 'healthy',
        url: 'https://api.farmsense.io',
        agents: ['Pulse', 'Sentinel', 'Iris'],
        lastDeploy: '2 hours ago',
        metrics: { uptime: '99.9%', response: '45ms', errors: 0 },
        actions: ['restart', 'deploy', 'logs', 'config', 'scale']
      },
      {
        id: 'farmsense-oracle',
        name: 'Oracle Bridge',
        platform: 'FarmSense',
        type: 'service',
        status: 'warning',
        url: 'oracle.farmsense.io',
        agents: ['Pulse'],
        lastDeploy: '1 day ago',
        metrics: { uptime: '95.2%', response: 'timeout', errors: 12 },
        actions: ['restart', 'rollback', 'logs', 'config'],
        alerts: ['Connection timeout - 16 hours']
      },
      {
        id: 'farmsense-mobile',
        name: 'Mobile App',
        platform: 'FarmSense',
        type: 'frontend',
        status: 'healthy',
        url: 'app.farmsense.io',
        agents: [],
        lastDeploy: '3 days ago',
        metrics: { uptime: '99.5%', response: '120ms', errors: 2 }
      },
      
      // Starting 5 Projects
      {
        id: 'starting5-backend',
        name: 'Starting 5 API',
        platform: 'Starting 5',
        type: 'backend',
        status: 'healthy',
        url: 'https://api.starting5.xyz',
        agents: ['Taylor', 'Jordan'],
        lastDeploy: '5 hours ago',
        metrics: { uptime: '99.8%', response: '89ms', errors: 0 },
        actions: ['restart', 'deploy', 'logs', 'config']
      },
      {
        id: 'starting5-web',
        name: 'Starting 5 Web',
        platform: 'Starting 5',
        type: 'frontend',
        status: 'healthy',
        url: 'https://starting5.xyz',
        agents: [],
        lastDeploy: '1 day ago',
        metrics: { uptime: '100%', response: '67ms', errors: 0 }
      },
      
      // Agent OS Projects
      {
        id: 'agent-os-core',
        name: 'Agent OS Platform',
        platform: 'Agent OS',
        type: 'platform',
        status: 'healthy',
        url: 'https://dashboard.bxthre3.com',
        agents: ['Erica', 'Maya', 'Raj', 'Sam'],
        lastDeploy: 'Just now',
        metrics: { uptime: '100%', response: '23ms', errors: 0 },
        actions: ['restart', 'deploy', 'logs', 'config', 'scale', 'backup']
      }
    ]
    setProjects(allProjects)
  }

  const executeAction = async (projectId, action, params = {}) => {
    // This would call the appropriate API (FarmSense, Starting 5, or Agent OS internal)
    console.log(`Executing ${action} on ${projectId}`, params)
    
    // Show confirmation/proposal in Agent OS style
    alert(`Proposal created: ${action} on ${projectId}\n\nWaiting for approval...`)
  }

  const executeBulkAction = async (action) => {
    const targetProjects = selectedProjects.length > 0 
      ? projects.filter(p => selectedProjects.includes(p.id))
      : projects
    
    console.log(`Bulk ${action} on ${targetProjects.length} projects`)
    
    // Create proposal for bulk action
    alert(`Bulk Proposal:\n${action} on ${targetProjects.map(p => p.name).join(', ')}\n\nRequires approval.`)
    setBulkAction(null)
  }

  const toggleProjectSelection = (projectId) => {
    setSelectedProjects(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    )
  }

  const selectGroup = (groupId) => {
    const group = groups.find(g => g.id === groupId)
    if (group) {
      if (group.projects.includes('*')) {
        setSelectedProjects(projects.map(p => p.id))
      } else {
        setSelectedProjects(group.projects)
      }
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="w-6 h-6 text-blue-500" />
          Admin Control Center
        </h2>
        <p className="text-zinc-400 text-sm mt-1">
          Manage all Bxthre3 projects — individually or in groups
        </p>
      </div>

      {/* Control Bar */}
      <div className="flex items-center justify-between mb-6 p-4 bg-zinc-900 rounded-lg">
        <div className="flex items-center gap-4">
          {/* Group Selector */}
          <select 
            className="bg-zinc-800 text-white px-3 py-2 rounded border border-zinc-700"
            onChange={(e) => selectGroup(e.target.value)}
            value=""
          >
            <option value="">Select Group...</option>
            {groups.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>

          {/* View Mode Toggle */}
          <div className="flex bg-zinc-800 rounded p-1">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-500' : ''}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-500' : ''}`}
            >
              <Layers className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedProjects.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-400">
              {selectedProjects.length} selected
            </span>
            <button 
              onClick={() => setBulkAction('restart')}
              className="px-3 py-2 bg-yellow-500/20 text-yellow-400 rounded hover:bg-yellow-500/30 flex items-center gap-2"
            >
              <RotateCw className="w-4 h-4" />
              Restart All
            </button>
            <button 
              onClick={() => setBulkAction('deploy')}
              className="px-3 py-2 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              Deploy All
            </button>
            <button 
              onClick={() => setSelectedProjects([])}
              className="px-3 py-2 bg-zinc-700 rounded hover:bg-zinc-600"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Platform Filter Tabs */}
      <div className="flex gap-2 mb-4">
        {['All', 'FarmSense', 'Starting 5', 'Agent OS'].map(platform => (
          <button 
            key={platform}
            className="px-4 py-2 bg-zinc-800 rounded-lg text-sm hover:bg-zinc-700"
          >
            {platform}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-3 gap-4">
        {projects.map(project => (
          <div 
            key={project.id}
            className={`p-4 rounded-lg border ${
              selectedProjects.includes(project.id) 
                ? 'border-blue-500 bg-blue-500/10' 
                : 'border-zinc-800 bg-zinc-900'
            }`}
          >
            {/* Project Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox"
                  checked={selectedProjects.includes(project.id)}
                  onChange={() => toggleProjectSelection(project.id)}
                  className="w-4 h-4 rounded"
                />
                <div>
                  <h3 className="font-semibold">{project.name}</h3>
                  <p className="text-xs text-zinc-500">{project.platform}</p>
                </div>
              </div>
              <div className={`px-2 py-1 rounded text-xs ${
                project.status === 'healthy' ? 'bg-green-500/20 text-green-400' :
                project.status === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {project.status}
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
              <div className="bg-zinc-800 p-2 rounded">
                <div className="text-zinc-500">Uptime</div>
                <div className={project.metrics.uptime.includes('99') ? 'text-green-400' : 'text-yellow-400'}>
                  {project.metrics.uptime}
                </div>
              </div>
              <div className="bg-zinc-800 p-2 rounded">
                <div className="text-zinc-500">Response</div>
                <div>{project.metrics.response}</div>
              </div>
              <div className="bg-zinc-800 p-2 rounded">
                <div className="text-zinc-500">Errors</div>
                <div className={project.metrics.errors === 0 ? 'text-green-400' : 'text-red-400'}>
                  {project.metrics.errors}
                </div>
              </div>
            </div>

            {/* Agents */}
            {project.agents.length > 0 && (
              <div className="mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-zinc-500" />
                <div className="flex gap-1">
                  {project.agents.map(agent => (
                    <span key={agent} className="text-xs bg-zinc-800 px-2 py-1 rounded">
                      {agent}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Alerts */}
            {project.alerts?.map((alert, i) => (
              <div key={i} className="mb-2 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded text-xs text-yellow-400 flex items-center gap-2">
                <AlertTriangle className="w-3 h-3" />
                {alert}
              </div>
            ))}

            {/* Actions */}
            <div className="flex gap-2 mt-3">
              <button 
                onClick={() => executeAction(project.id, 'restart')}
                className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 rounded text-sm flex items-center justify-center gap-1"
              >
                <RotateCw className="w-3 h-3" />
                Restart
              </button>
              <button 
                onClick={() => executeAction(project.id, 'logs')}
                className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 rounded text-sm"
              >
                Logs
              </button>
              <button 
                onClick={() => setActionMenu(actionMenu === project.id ? null : project.id)}
                className="py-2 px-3 bg-zinc-800 hover:bg-zinc-700 rounded text-sm"
              >
                ⋮
              </button>
            </div>

            {/* Action Menu Dropdown */}
            {actionMenu === project.id && (
              <div className="mt-2 p-2 bg-zinc-800 rounded border border-zinc-700">
                <button 
                  onClick={() => { executeAction(project.id, 'config'); setActionMenu(null) }}
                  className="w-full text-left p-2 hover:bg-zinc-700 rounded text-sm"
                >
                  <Settings className="w-4 h-4 inline mr-2" />
                  Edit Config
                </button>
                <button 
                  onClick={() => { executeAction(project.id, 'scale'); setActionMenu(null) }}
                  className="w-full text-left p-2 hover:bg-zinc-700 rounded text-sm"
                >
                  <Activity className="w-4 h-4 inline mr-2" />
                  Scale Resources
                </button>
                <button 
                  onClick={() => { executeAction(project.id, 'backup'); setActionMenu(null) }}
                  className="w-full text-left p-2 hover:bg-zinc-700 rounded text-sm"
                >
                  Create Backup
                </button>
                <button 
                  onClick={() => { executeAction(project.id, 'migrate'); setActionMenu(null) }}
                  className="w-full text-left p-2 hover:bg-zinc-700 rounded text-sm text-red-400"
                >
                  Emergency Migrate
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bulk Action Confirmation Modal */}
      {bulkAction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-700 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
              Bulk {bulkAction.charAt(0).toUpperCase() + bulkAction.slice(1)}
            </h3>
            <p className="text-zinc-400 mb-4">
              This will {bulkAction} {selectedProjects.length || projects.length} projects:
            </p>
            <div className="bg-zinc-800 p-3 rounded mb-4 max-h-40 overflow-y-auto">
              {(selectedProjects.length > 0 
                ? projects.filter(p => selectedProjects.includes(p.id))
                : projects
              ).map(p => (
                <div key={p.id} className="text-sm py-1">
                  • {p.name} ({p.platform})
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => executeBulkAction(bulkAction)}
                className="flex-1 py-3 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30"
              >
                Create Proposal
              </button>
              <button 
                onClick={() => setBulkAction(null)}
                className="flex-1 py-3 bg-zinc-700 rounded-lg hover:bg-zinc-600"
              >
                Cancel
              </button>
            </div>
            <p className="text-xs text-zinc-500 mt-3 text-center">
              Requires your approval before execution
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
