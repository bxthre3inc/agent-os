#!/bin/bash
# Bxthre3 Agent OS - Master Orchestrator
# Run this to manually trigger agent work cycles

set -e

WORK_DIR="/home/workspace/Bxthre3"
INBOX="$WORK_DIR/AGENT_INBOX.md"
QUEUE="$WORK_DIR/WORK_QUEUE.jsonl"

echo "🏢 Bxthre3 Agent OS - Orchestrator"
echo "===================================="
echo ""

# Check if files exist
if [ ! -f "$INBOX" ]; then
    echo "❌ Error: AGENT_INBOX.md not found at $INBOX"
    exit 1
fi

if [ ! -f "$QUEUE" ]; then
    echo "❌ Error: WORK_QUEUE.jsonl not found at $QUEUE"
    exit 1
fi

echo "✅ System files verified"
echo ""

# Count tasks
echo "📊 Task Summary:"
PENDING=$(grep -c '"status":"pending"' "$QUEUE" 2>/dev/null || echo 0)
P1=$(grep -c '"priority":"P1"' "$QUEUE" 2>/dev/null || echo 0)
P0=$(grep -c '"priority":"P0"' "$QUEUE" 2>/dev/null || echo 0)

echo "  Pending: $PENDING"
echo "  P1 Escalations: $P1"
echo "  P0 Critical: $P0"
echo ""

# Show recent inbox activity
echo "📥 Recent Inbox Activity:"
tail -30 "$INBOX" | grep -E "^###|^🔴|^🟡|^✅" | tail -10
echo ""

# Employee status
echo "👥 Employee Status:"
for emp in sentinel pulse drew alex casey iris chronicler erica; do
    STATUS_FILE="$WORK_DIR/agents/status/$emp.json"
    if [ -f "$STATUS_FILE" ]; then
        STATUS=$(grep -o '"status":"[^"]*"' "$STATUS_FILE" | head -1 | cut -d'"' -f4)
        MOOD=$(grep -o '"mood":"[^"]*"' "$STATUS_FILE" | head -1 | cut -d'"' -f4)
        echo "  $emp: $STATUS ($MOOD)"
    else
        echo "  $emp: No status file"
    fi
done
echo ""

echo "🎯 Quick Actions:"
echo "  View inbox:  cat $WORK_DIR/AGENT_INBOX.md"
echo "  View queue:  cat $WORK_DIR/WORK_QUEUE.jsonl"
echo "  Dashboard:   https://brodiblanco.zo.space/agents"
echo "  API:         https://brodiblanco.zo.space/api/work-queue"
echo ""

echo "✅ Orchestrator complete"
