#!/usr/bin/env bun
/**
 * GitHub Webhook Handler
 * Receives GitHub push/PR/issue events and routes to appropriate employees
 * 
 * Run: bun /home/workspace/Bxthre3/agents/webhooks/github-handler.ts <event.json>
 */

import { readFileSync, appendFileSync, writeFileSync } from "fs";

interface GitHubEvent {
  event_type: "push" | "pull_request" | "issues" | "pull_request_review";
  repository: string;
  sender: string;
  timestamp: string;
  data: any;
}

interface Task {
  id: string;
  type: string;
  priority: "P0" | "P1" | "P2" | "P3";
  status: "pending" | "claimed";
  assignee: string;
  created_at: string;
  data: any;
}

const WORK_QUEUE = "/home/workspace/Bxthre3/WORK_QUEUE.jsonl";
const INBOX = "/home/workspace/Bxthre3/AGENT_INBOX.md";

function logToInbox(agent: string, emoji: string, message: string) {
  const timestamp = new Date().toISOString();
  const line = `### [${timestamp}] ${agent}\n${emoji} ${message}\n\n`;
  
  // Insert after PINNED section (find the "---" after PINNED)
  const inbox = readFileSync(INBOX, "utf-8");
  const pinnedEnd = inbox.indexOf("---\n\n## 📅 Today's Activity Log");
  if (pinnedEnd > 0) {
    const before = inbox.slice(0, pinnedEnd + 3);
    const after = inbox.slice(pinnedEnd + 3);
    writeFileSync(INBOX, before + "\n" + line + after);
  }
}

function addTask(task: Task) {
  const line = JSON.stringify(task) + "\n";
  appendFileSync(WORK_QUEUE, line);
}

function handlePush(event: GitHubEvent) {
  const { repository, data } = event;
  const branch = data.ref?.replace("refs/heads/", "");
  const commits = data.commits?.length || 0;
  const changedFiles = data.commits?.flatMap((c: any) => [...(c.added || []), ...(c.modified || [])]) || [];
  
  // Check if security-sensitive files changed
  const securityFiles = changedFiles.filter((f: string) => 
    f.includes("secret") || f.includes("key") || f.includes("auth") || 
    f.includes("password") || f.includes("token") || f.includes("config")
  );
  
  if (securityFiles.length > 0) {
    addTask({
      id: `TASK-${Date.now()}`,
      type: "security-scan",
      priority: "P1",
      status: "pending",
      assignee: "sentinel",
      created_at: new Date().toISOString(),
      data: {
        trigger: "github-push",
        repository,
        branch,
        files: securityFiles,
        reason: "Security-sensitive files modified"
      }
    });
    logToInbox("sentinel", "🟡", `P1 Security scan queued: ${securityFiles.length} sensitive files changed in ${repository}`);
  }
  
  // Check if documentation needs update
  const docRelatedFiles = changedFiles.filter((f: string) =>
    f.includes("api") || f.includes("schema") || f.includes("interface") ||
    f.includes("README") || f.includes("docs/")
  );
  
  if (docRelatedFiles.length > 0) {
    addTask({
      id: `TASK-${Date.now() + 1}`,
      type: "doc-update",
      priority: "P2",
      status: "pending",
      assignee: "alex",
      created_at: new Date().toISOString(),
      data: {
        trigger: "github-push",
        repository,
        branch,
        files: docRelatedFiles,
        reason: "Documentation-related code changes"
      }
    });
  }
  
  // Create code review task for Drew
  addTask({
    id: `TASK-${Date.now() + 2}`,
    type: "code-review",
    priority: "P2",
    status: "pending",
    assignee: "drew",
    created_at: new Date().toISOString(),
    data: {
      trigger: "github-push",
      repository,
      branch,
      commits: data.commits?.map((c: any) => c.id),
      changed_files: changedFiles.length
    }
  });
  
  logToInbox("chronicler", "✅", `GitHub push to ${repository}/${branch}: ${commits} commits, ${changedFiles.length} files changed. Tasks created for sentinel, alex, drew.`);
}

function handlePullRequest(event: GitHubEvent) {
  const { repository, data } = event;
  const action = data.action;
  const pr = data.pull_request;
  
  if (action === "opened" || action === "synchronize") {
    addTask({
      id: `TASK-${Date.now()}`,
      type: "code-review",
      priority: "P2",
      status: "pending",
      assignee: "drew",
      created_at: new Date().toISOString(),
      data: {
        trigger: "github-pr",
        repository,
        pr_number: pr.number,
        pr_title: pr.title,
        author: pr.user.login,
        branch: pr.head.ref,
        changed_files: pr.changed_files
      }
    });
    
    logToInbox("drew", "🟡", `New PR #${pr.number} in ${repository}: "${pr.title}" - review queued`);
  }
  
  if (action === "closed" && pr.merged) {
    logToInbox("chronicler", "✅", `PR #${pr.number} merged to ${repository}/${pr.base.ref}`);
    
    // Trigger doc update check
    addTask({
      id: `TASK-${Date.now()}`,
      type: "doc-drift-check",
      priority: "P2",
      status: "pending",
      assignee: "alex",
      created_at: new Date().toISOString(),
      data: {
        trigger: "pr-merged",
        repository,
        pr_number: pr.number,
        pr_title: pr.title
      }
    });
  }
}

function handleIssue(event: GitHubEvent) {
  const { repository, data } = event;
  const action = data.action;
  const issue = data.issue;
  
  if (action === "opened") {
    addTask({
      id: `TASK-${Date.now()}`,
      type: "issue-triage",
      priority: "P2",
      status: "pending",
      assignee: "drew",
      created_at: new Date().toISOString(),
      data: {
        trigger: "github-issue",
        repository,
        issue_number: issue.number,
        issue_title: issue.title,
        author: issue.user.login,
        labels: issue.labels?.map((l: any) => l.name)
      }
    });
    
    logToInbox("drew", "🟡`, `New issue #${issue.number} in ${repository}: "${issue.title}" - triage queued`);
  }
}

// Main
if (process.argv.length < 3) {
  console.log("Usage: bun github-handler.ts <event.json>");
  process.exit(1);
}

const eventFile = process.argv[2];
const event: GitHubEvent = JSON.parse(readFileSync(eventFile, "utf-8"));

console.log(`[${new Date().toISOString()}] Processing ${event.event_type} from ${event.repository}`);

switch (event.event_type) {
  case "push":
    handlePush(event);
    break;
  case "pull_request":
    handlePullRequest(event);
    break;
  case "issues":
    handleIssue(event);
    break;
  default:
    console.log(`Unknown event type: ${event.event_type}`);
}

console.log("Done.");
