#!/usr/bin/env bun
/**
 * Bootstrap: Connect Event Router to All Agents
 * 
[truncated]	hub:pr", (event) => {
  console.log(`[Bootstrap] GitHub PR #${event.pr?.number} → Drew (code review)`);
  
  // Auto-assign to Drew with high priority
  const task = {
    id: `DREW-${Date.now()}`,
    type: "code-review",
    priority: "P2",
    status: "pending",
    assignee: "drew",
    repository: event.repository,
    pr: event.pr,
    created_at: new Date().toISOString(),
    eta_completion: new Date(Date.now() + 2 * 60 * 1000).toISOString(), // 2 min
  };
  
  appendTask(task);
  
  // Trigger immediate execution if low risk
  if (event.pr?.changed_files && event.pr.changed_files < 10) {
    console.log(`[Bootstrap] Small PR (${event.pr.changed_files} files) → auto-executing`);
    // Spawn Drew's analysis
    const { spawn } = await import("child_process");
    spawn("bun", ["run", "agents/drew-auto.ts", "review", event.repository, event.pr.number.toString()], {
      detached: true,
      stdio: "ignore",
    });
  }
});

// GitHub: Issue opened
router.on("github:issue", (event) => {
  console.log(`[Bootstrap] GitHub issue #${event.issue?.number} → Drew (triage)`);
  
  const task = {
    id: `DREW-${Date.now()}`,
    type: "issue-triage",
    priority: "P2",
    status: "pending",
    assignee: "drew",
    issue: event.issue,
    created_at: new Date().toISOString(),
  };
  
  appendTask(task);
});

// GitHub: CI Failure
router.on("github:ci-failure", (event) => {
  console.log(`[Bootstrap] CI failure in ${event.workflow} → Drew (investigate)`);
  
  const task = {
    id: `DREW-${Date.now()}`,
    type: "ci-failure-investigation",
    priority: "P1",
    status: "pending",
    assignee: "drew",
    workflow: event.workflow,
    repository: event.repository,
    urgency: "high",
    created_at: new Date().toISOString(),
  };
  
  appendTask(task);
  
  // P1 = immediate notification
  notifyBriefing({
    type: "alert",
    priority: "P1",
    source: "github-ci",
    title: `CI Failure: ${event.workflow}`,
    message: `Repository: ${event.repository}`,
    timestamp: new Date().toISOString(),
  });
});

// GitHub: Release published
router.on("github:release", (event) => {
  console.log(`[Bootstrap] Release ${event.release?.tag_name} → Alex (docs update), Casey (grant impact)`);
  
  // Trigger multiple agents
  const tasks = [
    {
      id: `ALEX-${Date.now()}`,
      type: "docs-update",
      priority: "P2",
      status: "pending",
      assignee: "alex",
      release: event.release,
      created_at: new Date().toISOString(),
    },
    {
      id: `CASEY-${Date.now()}`,
      type: "grant-impact-check",
      priority: "P2",
      status: "pending",
      assignee: "casey",
      release: event.release,
      created_at: new Date().toISOString(),
    },
  ];
  
  for (const task of tasks) {
    appendTask(task);
  }
});

// ==================== FILE WATCHER EVENTS ====================

// File: Code changed
router.on("file:change", (event) => {
  if (event.changeType === "deleted") return; // Ignore deletions for code review
  
  const isCodeFile = event.path?.endsWith(".ts") || event.path?.endsWith(".js") || event.path?.endsWith(".tsx");
  const isDocFile = event.path?.endsWith(".md") || event.path?.includes("docs/");
  
  if (isCodeFile) {
    console.log(`[Bootstrap] Code file ${event.path} → Drew (analysis)`);
    
    // Risk score the change
    const riskScore = calculateRiskScore(event.path, event.size || 0);
    
    if (riskScore <= 15 && !event.requiresReview) {
      // Auto-execute: Drew analyzes and potentially fixes
      console.log(`[Bootstrap] Low risk (${riskScore}) → Auto-executing`);
      
      const { spawn } = await import("child_process");
      spawn("bun", ["run", "agents/drew-auto.ts", "analyze", event.path], {
        detached: true,
        stdio: "ignore",
      });
      
      logAutoAction({
        agent: "drew",
        action: "auto-analyze",
        file: event.path,
        riskScore,
        timestamp: new Date().toISOString(),
      });
    } else {
      // Queue for review
      appendTask({
        id: `DREW-${Date.now()}`,
        type: "code-review",
        priority: riskScore > 30 ? "P1" : "P2",
        status: "pending",
        assignee: "drew",
        file: event.path,
        riskScore,
        created_at: new Date().toISOString(),
      });
    }
  }
  
  if (isDocFile && !event.path.includes("AGENT_INBOX")) {
    console.log(`[Bootstrap] Doc file ${event.path} → Alex (format/drift check)`);
    
    // Auto-format if low risk
    const { spawn } = await import("child_process");
    spawn("bun", ["run", "agents/alex-auto.ts", "format", event.path], {
      detached: true,
      stdio: "ignore",
    });
  }
});

// ==================== PREDICTIVE EVENTS ====================

// Predicted work becomes available
router.on("predictive:work-available", (event) => {
  console.log(`[Bootstrap] Predictive work: ${event.description} → ${event.suggestedAgent}`);
  
  if (event.confidence > 0.8) {
    // High confidence = pre-warm the agent
    console.log(`[Bootstrap] High confidence (${event.confidence}) → Pre-warming ${event.suggestedAgent}`);
    
    appendTask({
      id: `PRED-${Date.now()}`,
      type: "predictive",
      priority: "P3",
      status: "warming",
      assignee: event.suggestedAgent,
      description: event.description,
      confidence: event.confidence,
      eta_trigger: event.etaTrigger,
      created_at: new Date().toISOString(),
    });
  }
});

// ==================== STREAMING BRIEFING ====================

// All events also stream to briefing
const streamingBriefing = new StreamingBriefing();

router.onAny((event) => {
  // Add to streaming briefing (real-time)
  streamingBriefing.update({
    type: event.type,
    timestamp: new Date().toISOString(),
    summary: formatEventSummary(event),
    priority: event.urgent ? "P1" : "P2",
  });
});

// ==================== MAIN ====================

export function bootstrap() {
  console.log("[Bootstrap] TRUE Optimization Layer Active");
  console.log("[Bootstrap] Event router connected to:");
  console.log("  - GitHub webhooks (push, PR, issues, releases, CI)");
  console.log("  - File watcher (code, docs, IP/legal)");
  console.log("  - Predictive engine");
  console.log("  - Streaming briefing (real-time)");
  console.log("[Bootstrap] Agents: Drew, Alex, Casey, Iris, Sentinel, Chronicler");
  console.log("[Bootstrap] Latency target: <5 seconds from event to agent action");
  
  // Start file watcher
  const { registerFileEventHandlers, startFileWatcher } = await import("./file-watcher");
  registerFileEventHandlers();
  startFileWatcher({
    interval: 5000, // 5 second scan
    verbose: true,
  });
  
  // Start streaming briefing
  streamingBriefing.start();
  
  return router;
}

// Auto-execute if run directly
if (import.meta.main) {
  bootstrap();
  
  // Keep alive
  setInterval(() => {
    console.log(`[Bootstrap] Heartbeat: ${new Date().toISOString()}`);
  }, 60000);
}
