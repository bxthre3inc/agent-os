# 🏢 Bxthre3 Agent OS v1.0
**Digital Employee Operating System**

---

## Overview

This is a self-managing team of autonomous AI employees that operates Bxthre3 and FarmSense. Unlike scheduled agents that spam you every 15 minutes, these employees:

1. **Pull from a work queue** when tasks exist
2. **Find work proactively** when idle
3. **Execute autonomously** without asking permission for everything
4. **Escalate only** when blocked or for critical decisions
5. **Communicate in a single thread** (AGENT_INBOX.md)

---

## Quick Start

### Check Status
```bash
# View work queue
cat /home/workspace/Bxthre3/WORK_QUEUE.jsonl

# View inbox (single thread)
cat /home/workspace/Bxthre3/AGENT_INBOX.md

# View employee status
cat /home/workspace/Bxthre3/agents/status/*.json
```

### Add a Task
Add a line to `WORK_QUEUE.jsonl`:
```json
{"id":"TASK-NEW","type":"code-review","priority":"P2","status":"pending","assignee":"drew","created_at":"2026-03-16T18:00:00Z","due_at":"2026-03-17T18:00:00Z","data":{"repo":"bxthre3inc/farmsense-main","pr":123},"dependencies":[],"escalation_level":"none"}
```

### Reply to Agents
Add a line to `AGENT_INBOX.md` after the PINNED section:
```markdown
### [2026-03-16 18:00 UTC] brodiblanco
@Sentinel TASK-001 approved for auto-fix. The secrets are dev-only.
```

---

## Employee Roster

| Employee | Role | Department | Schedule | Status File |
|----------|------|------------|----------|-------------|
| **Sentinel** | Security & IP Monitor | Security | 24/7 event-driven | `status/sentinel.json` |
| **Pulse** | System Health Monitor | Engineering | Event-driven | `status/pulse.json` |
| **Drew** | Senior Software Engineer | Engineering | Mon-Fri 9-5 MT | `status/drew.json` |
| **Alex** | Technical Writer | Operations | Task-driven | `status/alex.json` |
| **Casey** | Grant Coordinator | Operations | Sprint-based | `status/casey.json` |
| **Iris** | IP & Patent Specialist | Security | Weekly + daily | `status/iris.json` |
| **Chronicler** | Memory & Records | Operations | Continuous | `status/chronicler.json` |
| **Erica** | Executive Briefing | Executive | 2× daily | `status/erica.json` |

### Department Heads (Part of broader team)
- **Maya** (VP Engineering) - Engineering decisions
- **Raj** (VP Operations) - Operations & deadlines
- **Sam** (VP Finance) - Budget, fundraising, investors

---

## Core Files

| File | Purpose |
|------|---------|
| `WORK_QUEUE.jsonl` | Central task queue. All work lives here. |
| `AGENT_INBOX.md` | **Single thread** for all agent communication. Check here daily. |
| `agents/instructions/*.md` | Employee handbooks (how each agent works) |
| `agents/status/*.json` | Real-time employee status |
| `agents/comms/*.jsonl` | Inter-employee messaging |
| `agents/webhooks/*.ts` | Event handlers (GitHub, file changes) |

---

## How It Works

### 1. Event Triggers (No More 15-Minute Spam!)

Instead of waking every 15 minutes, employees run when:

| Trigger | Who Runs | Example |
|---------|----------|---------|
| GitHub push | Sentinel (security scan), Alex (doc check), Drew (code review) | Someone pushes to main |
| File change in docs/ | Alex (drift detection) | Someone edits specs |
| Service alert | Pulse (investigate), Drew (if fix needed) | API error spike |
| Deadline -7 days | Casey (escalate), Erica (briefing) | Grant deadline approaching |
| Task assigned | The assignee | You add a task to WORK_QUEUE |
| Idle time | Self-directed work discovery | No tasks → scan for work |

### 2. Task Lifecycle

```
WORK_QUEUE.jsonl
     ↓
Employee CLAIMS task (status: pending → claimed)
     ↓
Employee EXECUTES (status: claimed → in_progress)
     ↓
Employee COMPLETES (status: in_progress → done)
     ↓
Log to AGENT_INBOX.md
```

### 3. Escalation Levels

| Level | When Used | Example |
|-------|-----------|---------|
| **none** | Employee handles alone | Routine code review |
| **employee** | Needs coworker input | Drew needs Alex to update docs |
| **department_head** | Needs leadership decision | Maya to approve architecture change |
| **ceo** | Critical, needs your action | P1 security finding, grant deadline at risk |

### 4. Communication Protocol

**To You (via AGENT_INBOX.md only):**
- 🔴 P0/P1: Critical, requires your action
- 🟡 P2: Warning, you should know
- ✅ Normal completion/update

**Never:**
- Create new chat threads
- Send you email/SMS for routine updates
- Wake you up for non-critical issues

**To Other Employees (via `agents/comms/`):**
- File: `sentinel-to-drew.jsonl`
- Used for cross-employee dependencies
- Format: `{timestamp, type, urgency, message, related_task}`

---

## Daily Workflow

### For You (brodiblanco)

**Morning:**
1. Check `AGENT_INBOX.md` for 🔴 P0/P1 escalations
2. Read Erica's morning briefing
3. Respond to any questions inline

**Evening:**
1. Read Erica's evening briefing
2. Clear any 🟡 items that need attention
3. Done!

### For Employees

**When Triggered:**
1. Read WORK_QUEUE for tasks assigned to me
2. Claim highest priority pending task
3. Execute
4. Update status file
5. Log to INBOX if needed

**When Idle:**
1. Scan for work (GitHub, files, deadlines)
2. If work found → create task → execute
3. If no work → stay idle, wait for trigger

---

## Adding New Employees

1. Create `agents/instructions/{name}.md` with:
   - Role & responsibilities
   - Work queue integration
   - Escalation rules
   - Status file format

2. Add entry to this roster

3. Create `agents/status/{name}.json` with initial state

4. Set up triggers (webhooks, schedules, or manual)

---

## Troubleshooting

### No employees running?
Check triggers:
```bash
# Manual trigger
curl -X POST https://brodiblanco.zo.space/api/agent-webhook \
  -H "Content-Type: application/json" \
  -d '{"agent":"sentinel","action":"scan"}'
```

### Task stuck?
Check WORK_QUEUE:
```bash
cat WORK_QUEUE.jsonl | grep "TASK-XXX"
```
If status is `claimed` but old → employee may be stuck, reassign or escalate

### Too many 🔴 escalations?
Review AGENT_INBOX.md PINNED section. Clear resolved items by:
1. Fixing the underlying issue
2. Replying with resolution
3. Moving entry from PINNED to Activity Log

---

## Architecture Principles

1. **Work Queue Centric** — All work lives in one place
2. **Event-Driven** — No polling, no spam
3. **Autonomous Execution** — Employees do, don't just report
4. **Single Inbox** — One thread, not 50 chat windows
5. **Clear Escalation** — You only see what needs your attention
6. **Self-Directed** — Employees find work when idle

---

*Agent OS v1.0 - Built for Bxthre3 Inc*
*Created: 2026-03-16*
*Maintained by: The Digital Employee Team*
