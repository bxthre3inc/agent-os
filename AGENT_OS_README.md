# 🏢 Bxthre3 Agent OS v1.0 - Complete System

## ✅ DEPLOYMENT COMPLETE

All 23 spam agents have been **deleted** and replaced with a clean, event-driven system.

---

## What Changed?

### Before (Chaos)
- ❌ 25 agents running every 15 minutes
- ❌ Creating new chat/email threads every run
- ❌ Just reporting, not executing
- ❌ Flooding you with noise

### After (Clean)
- ✅ 6 scheduled agents with `delivery_method: "none"` (no spam)
- ✅ Event-driven triggers (GitHub, file changes)
- ✅ Work queue system with state tracking
- ✅ Single inbox thread (`AGENT_INBOX.md`)
- ✅ Autonomous execution (employees DO work, not just report)

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    EVENT SOURCES                        │
│  GitHub ─┬─► Agent Webhook ─┐                           │
│  Files   │   (/api/agent-webhook)                        │
│  Manual ─┘                  │                            │
│                             ▼                            │
│  Scheduled: ┌─────────────┴─────────────┐              │
│  - Erica (2×/day)                         │              │
│  - Sentinel (hourly)                        │              │
│  - Pulse (hourly)         WORK_QUEUE      │              │
│  - Casey (daily)         (tasks.jsonl)    │              │
│  - Iris (daily)             │              │              │
│  - Chronicler (daily)       ▼              │              │
│                         ┌───────┐          │              │
│                         │ AGENTS│◄─────────┘              │
│                         └───────┘                         │
│                             │                            │
│                             ▼                            │
│                     ┌───────────────┐                    │
│                     │ AGENT_INBOX   │◄── You check here  │
│                     │   (.md)       │                    │
│                     └───────────────┘                    │
└─────────────────────────────────────────────────────────┘
```

---

## Your New Daily Workflow

### Morning (8 AM MT)
Erica posts morning briefing to `AGENT_INBOX.md` with:
- 🔴 Items requiring your action
- 🟡 Things to be aware of
- ✅ What got done overnight
- 📅 Today's priorities

### Throughout Day
- Agents write to INBOX only when needed (🔴 P1, 🟡 P2)
- You check INBOX when convenient (not 50 chat threads)
- Reply inline in INBOX using `@AgentName`

### Evening (6 PM MT)
Erica posts evening briefing with day summary.

### Night (8 PM MT)
Chronicler posts daily digest and saves to Supermemory.

---

## Key Files

| File | Purpose | How to Access |
|------|---------|---------------|
| `AGENT_INBOX.md` | Single thread for all communication | `cat Bxthre3/AGENT_INBOX.md` or Dashboard |
| `WORK_QUEUE.jsonl` | Central task queue | `cat Bxthre3/WORK_QUEUE.jsonl` or API |
| `agents/status/*.json` | Employee status | `cat Bxthre3/agents/status/[name].json` |
| Dashboard | Web UI | https://brodiblanco.zo.space/agents |
| API | Programmatic access | https://brodiblanco.zo.space/api/work-queue |

---

## Active Agents

| Agent | Role | Schedule | Model | Delivery |
|-------|------|----------|-------|----------|
| **Erica** | Executive Briefing | 2× daily (8AM, 6PM MT) | kimi-k2.5 | INBOX only |
| **Sentinel** | Security/IP Monitor | Hourly | minimax-m2.5 | INBOX only |
| **Pulse** | System Health | Hourly | minimax-m2.5 | INBOX only |
| **Casey** | Grant Coordinator | Daily 9AM MT | kimi-k2.5 | INBOX only |
| **Iris** | IP Surveillance | Daily 10AM MT | byok | INBOX only |
| **Chronicler** | Daily Digest | Daily 8PM MT | kimi-k2.5 | INBOX only |

---

## Event-Driven Agents (Triggered by Webhooks)

These agents don't run on a schedule - they're triggered by events:

| Agent | Triggers |
|-------|----------|
| **Drew** | GitHub push, PR opened, issue opened |
| **Alex** | File changes in docs/, PR merged |

---

## Current Active Tasks

From your work queue:

| Task | Priority | Assignee | Status | Action Needed |
|------|----------|----------|--------|---------------|
| TASK-001 | P1 | Sentinel | Pending | 🔴 Verify hardcoded secrets are dev-only |
| TASK-003 | P1 | Iris | Pending | 🔴 Review 5 trademark conflicts |
| TASK-004 | P1 | Casey | In Progress | 🟡 ESTCP grant (T-10 days), blocked on TASK-005 |
| TASK-005 | P1 | Alex | Pending | 🟡 Spectroscopy spec for Casey |
| TASK-002 | P2 | Pulse | Pending | Oracle endpoint down (external) |
| TASK-006 | P2 | Drew | Pending | Routine code review |

---

## API Endpoints

### Webhook (for GitHub/file events)
```bash
curl -X POST https://brodiblanco.zo.space/api/agent-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "github-push",
    "repository": "bxthre3inc/farmsense-main",
    "data": { "branch": "main", "commits": [...] }
  }'
```

### Work Queue
```bash
# List all tasks
curl https://brodiblanco.zo.space/api/work-queue

# List pending P1 tasks
curl "https://brodiblanco.zo.space/api/work-queue?status=pending&priority=P1"

# Add a task
curl -X POST https://brodiblanco.zo.space/api/work-queue \
  -H "Content-Type: application/json" \
  -d '{
    "type": "code-review",
    "assignee": "drew",
    "priority": "P2",
    "data": { "pr": 123 }
  }'
```

### Inbox
```bash
# Read inbox
curl https://brodiblanco.zo.space/api/agent-inbox
```

---

## How to Use

### Check Status
```bash
# Quick status
./Bxthre3/agents/orchestrator.sh

# Or manually:
cat Bxthre3/AGENT_INBOX.md     # Check messages
cat Bxthre3/WORK_QUEUE.jsonl   # Check tasks
```

### Reply to Agents
Edit `AGENT_INBOX.md` and add:
```markdown
### [2026-03-16 18:30 UTC] brodiblanco
@Sentinel TASK-001 approved for auto-fix. Those secrets are dev-only.
```

### Add a Task
Add to `WORK_QUEUE.jsonl`:
```json
{"id":"TASK-NEW","type":"feature","priority":"P2","status":"pending","assignee":"drew","created_at":"2026-03-16T18:30:00Z","data":{"feature":"dark mode"}}
```

Or use the API:
```bash
curl -X POST https://brodiblanco.zo.space/api/work-queue \
  -H "Content-Type: application/json" \
  -d '{"type":"feature","assignee":"drew","priority":"P2","data":{"feature":"dark mode"}}'
```

---

## Next Steps for You

1. **Check AGENT_INBOX.md** - Review the 🔴 P1 items
2. **Visit Dashboard** - https://brodiblanco.zo.space/agents
3. **Respond to escalations** - Reply in INBOX or fix the underlying issues
4. **Let it run** - Agents will now work autonomously

---

## System Maintenance

### To Add a New Agent
1. Create instruction file: `agents/instructions/{name}.md`
2. Create status file: `agents/status/{name}.json`
3. Add to roster in this README
4. If scheduled: `create_agent` with `delivery_method: "none"`
5. If event-driven: Add trigger to webhook handler

### To Change Agent Behavior
1. Edit the agent's instruction file
2. The agent reads it on next run

### To Pause the System
1. List agents: `list_agents`
2. Edit each: `edit_agent(agent_id, active=False)`

---

## Architecture Principles

1. **Work Queue Centric** - All work in one place
2. **Event-Driven** - No 15-minute polling spam
3. **Autonomous Execution** - Employees DO work
4. **Single Inbox** - One thread, not 50 chats
5. **Clear Escalation** - You only see what needs you

---

## Files Created

```
Bxthre3/
├── AGENT_INBOX.md                    # Single communication thread
├── WORK_QUEUE.jsonl                  # Central task queue
├── AGENT_OS_README.md               # This file
├── agents/
│   ├── AGENTS.md                    # Full architecture docs
│   ├── orchestrator.sh              # Status check script
│   ├── instructions/
│   │   ├── sentinel.md              # Security/IP monitor handbook
│   │   ├── pulse.md                 # System health handbook
│   │   ├── drew.md                  # Software engineer handbook
│   │   ├── alex.md                  # Tech writer handbook
│   │   ├── casey.md                 # Grant coordinator handbook
│   │   ├── iris.md                  # IP specialist handbook
│   │   ├── chronicler.md            # Records keeper handbook
│   │   └── erica.md                 # Executive briefing handbook
│   ├── status/
│   │   ├── sentinel.json            # Live status
│   │   ├── pulse.json
│   │   ├── drew.json
│   │   ├── alex.json
│   │   ├── casey.json
│   │   ├── iris.json
│   │   ├── chronicler.json
│   │   └── erica.json
│   ├── comms/                       # Inter-employee messaging (future)
│   └── webhooks/
│       ├── github-handler.ts        # GitHub event router
│       └── file-watcher.ts          # File change detector
```

zo.space routes:
- `/agents` - Dashboard UI
- `/api/agent-webhook` - Event router
- `/api/work-queue` - Task API
- `/api/agent-inbox` - Inbox API

---

*Agent OS v1.0 - No more chat spam*
*Deployed: 2026-03-16*
*23 old agents deleted, 6 new clean agents created*
