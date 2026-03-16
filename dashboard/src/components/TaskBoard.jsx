import { useState } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { GripVertical, User, AlertCircle } from 'lucide-react'

const initialTasks = {
  erica: [
    { id: 't1', title: 'Draft executive briefing', priority: 'high', est: '2h' },
    { id: 't2', title: 'Review Q1 metrics', priority: 'medium', est: '1h' }
  ],
  pulse: [
    { id: 't3', title: 'Oracle health check', priority: 'high', est: '30m' },
    { id: 't4', title: 'Disk space alert', priority: 'low', est: '15m' }
  ],
  sentinel: [
    { id: 't5', title: 'Secret scan - farmsense-code', priority: 'high', est: '1h' }
  ],
  alex: [
    { id: 't6', title: 'Update API docs', priority: 'medium', est: '3h' },
    { id: 't7', title: 'Fix README typos', priority: 'low', est: '30m' }
  ],
  drew: [
    { id: 't8', title: 'Oracle timeout fix', priority: 'high', est: '4h' },
    { id: 't9', title: 'Circuit breaker pattern', priority: 'high', est: '3h' }
  ],
  casey: [
    { id: 't10', title: 'ESTCP narrative section 3', priority: 'high', est: '6h', blocked: true },
    { id: 't11', title: 'Budget spreadsheet', priority: 'medium', est: '2h' }
  ]
}

export default function TaskBoard({ onReassign }) {
  const [tasks, setTasks] = useState(initialTasks)
  const [message, setMessage] = useState('')

  const onDragEnd = (result) => {
    if (!result.destination) return

    const sourceAgent = result.source.droppableId
    const destAgent = result.destination.droppableId
    const taskId = result.draggableId

    if (sourceAgent === destAgent) return

    const task = tasks[sourceAgent].find(t => t.id === taskId)
    
    setTasks(prev => ({
      ...prev,
      [sourceAgent]: prev[sourceAgent].filter(t => t.id !== taskId),
      [destAgent]: [...prev[destAgent], task]
    }))

    setMessage(`✅ Reassigned "${task.title}" from ${sourceAgent} to ${destAgent}`)
    setTimeout(() => setMessage(''), 3000)

    onReassign?.(taskId, sourceAgent, destAgent)
  }

  return (
    <div className="p-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <GripVertical className="w-5 h-5" />
          Task Board — Drag to Reassign
        </h2>
        <p className="text-zinc-400 text-sm">Drag tasks between agents to reassign work</p>
      </div>

      {message && (
        <div className="mb-4 p-3 bg-green-500/20 text-green-400 rounded">
          {message}
        </div>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(tasks).map(([agentId, agentTasks]) => (
            <Droppable key={agentId} droppableId={agentId}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="bg-zinc-800 rounded-lg p-4 min-h-[200px]"
                >
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-zinc-700">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold text-sm">
                      {agentId[0].toUpperCase()}
                    </div>
                    <span className="font-semibold capitalize">{agentId}</span>
                    <span className="ml-auto text-zinc-500 text-sm">{agentTasks.length}</span>
                  </div>

                  <div className="space-y-2">
                    {agentTasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`p-3 rounded cursor-move transition ${
                              snapshot.isDragging ? 'bg-blue-500/20 shadow-lg' : 'bg-zinc-700'
                            } ${task.blocked ? 'border border-yellow-500/50' : ''}`}
                          >
                            <div className="flex items-start gap-2">
                              <GripVertical className="w-4 h-4 text-zinc-500 mt-0.5" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">{task.title}</span>
                                  {task.blocked && <AlertCircle className="w-4 h-4 text-yellow-500" />}
                                </div>
                                <div className="flex items-center gap-3 mt-1 text-xs text-zinc-400">
                                  <span className={`px-2 py-0.5 rounded ${
                                    task.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                                    task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                    'bg-zinc-600 text-zinc-400'
                                  }`}>
                                    {task.priority}
                                  </span>
                                  <span>{task.est}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                  </div>
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      <div className="mt-6 p-4 bg-zinc-800 rounded text-sm text-zinc-400">
        <h4 className="font-semibold text-white mb-2">How to reassign:</h4>
        <ol className="list-decimal list-inside space-y-1">
          <li>Drag any task by its handle (⋮⋮)</li>
          <li>Drop onto another agent's column</li>
          <li>Task is instantly reassigned with notification</li>
          <li>Blocked tasks (⚠️) require dependency resolution first</li>
        </ol>
      </div>
    </div>
  )
}
