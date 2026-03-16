# 🧪 Agent OS Test Suite

## Overview

Safe testing environment for agent behaviors without affecting production.

## Test Structure

```
tests/
├── agent-test-harness.ts    # CLI tool for testing
├── fixtures/                # Mock data for testing
│   ├── work-queue.jsonl
│   └── inbox.md
├── scenarios/              # Pre-defined test cases
│   ├── security-breach.json
│   ├── grant-deadline.json
│   └── doc-drift.json
└── README.md
```

## Usage

### 1. Initialize Test Environment
```bash
cd /home/workspace/Bxthre3/agent-os-repo
bun tests/agent-test-harness.ts init
```

Creates isolated test fixtures in `tests/fixtures/`.

### 2. Create Test Task
```bash
bun tests/agent-test-harness.ts create-task sentinel
```

Adds a realistic test task to the mock queue.

### 3. Run Agent (Test Mode)
```bash
# Review instructions first
cat agents/instructions/sentinel.md

# Execute against test data
bun tests/agent-test-harness.ts run-agent sentinel
```

### 4. Review Results
```bash
cat tests/fixtures/inbox.md
cat tests/fixtures/work-queue.jsonl
```

## Pre-defined Scenarios

| Scenario | Tests | File |
|----------|-------|------|
| Security breach | Sentinel auto-escalation | `scenarios/security-breach.json` |
| Grant deadline | Casey priority routing | `scenarios/grant-deadline.json` |
| Doc drift | Alex sync detection | `scenarios/doc-drift.json` |

## Running Full Test Suite

```bash
# Test all agents against all scenarios
bun tests/run-all-tests.ts
```

## CI/CD Integration

Tests run automatically on PR:
- Pre-commit hook: `bun tests/quick-check.ts`
- PR check: `bun tests/full-suite.ts`
- Merge gate: All tests must pass

---

*Test Suite v1.0 - Phase 1.1 Foundation*
