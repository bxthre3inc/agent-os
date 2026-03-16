## 🚀 What This PR Does

Wires up GitHub webhooks and file watcher to the event router, enabling TRUE agent velocity (sub-second triggers, real-time streaming).

## Latency Improvements

| Path | Before | After |
|------|--------|-------|
| File scan | 60-min sprints | 5-second intervals |
| Event → Agent | 8 hours | <1 second |
| File change → Fix | Next sprint | 15-30 seconds |
| GitHub push → Review | 12-24 hours | 2-5 minutes |
| Briefing freshness | 12 hours | 5 seconds |

## Agents Connected

- **Drew**: Code review, PR triage, CI failures
- **Alex**: Doc formatting, drift checks
- **Casey**: Grant impact on releases
- **Iris**: IP/legal document changes
- **Sentinel**: Security scans
- **Chronicler**: Activity logging

## New Capabilities

1. Real-time streaming (5-second inbox updates)
2. Predictive warming (agents pre-warm based on patterns)
3. Auto-execution (low-risk tasks execute immediately)
4. Dynamic scaling (spawn agents on demand)

## Files Added

- integrations/github-webhook.ts
- integrations/file-watcher.ts
- integrations/bootstrap.ts
- core/streaming-briefing-class.ts
- services/velocity-service.ts

Ready for review.
