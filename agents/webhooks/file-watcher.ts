#!/usr/bin/env bun
/**
 * File Change Watcher
 * Monitors workspace for file changes and routes to appropriate employees
 * 
 * Run: bun /home/workspace/Bxthre3/agents/webhooks/file-watcher.ts
 */

import { readFileSync, appendFileSync, writeFileSync, statSync, readdirSync } from "fs";
import { join } from "path";

const STATE_FILE = "/home/workspace/Bxthre3/agents/.file-watcher-state.json";
const WATCH_PATHS = [
  "/home/workspace/Bxthre3/the-farmsense-project/docs",
  "/home/workspace/Bxthre3/the-farmsense-project/FarmSense/Investor_Materials",
  "/home/workspace/investor-materials"
];

interface FileState {
  path: string;
  mtime: number;
  size: number;
}

interface WatcherState {
  last_scan: string;
  files: Record<string, FileState>;
}

function loadState(): WatcherState {
  try {
    return JSON.parse(readFileSync(STATE_FILE, "utf-8"));
  } catch {
    return { last_scan: new Date(0).toISOString(), files: {} };
  }
}

function saveState(state: WatcherState) {
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function scanDirectory(dir: string, state: WatcherState): FileState[] {
  const changed: FileState[] = [];
  
  function scan(path: string) {
    try {
      const entries = readdirSync(path, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = join(path, entry.name);
        
        if (entry.isDirectory()) {
          scan(fullPath);
        } else if (entry.isFile() && entry.name.endsWith(".md")) {
          try {
            const stats = statSync(fullPath);
            const key = fullPath;
            const existing = state.files[key];
            
            if (!existing || existing.mtime !== stats.mtimeMs || existing.size !== stats.size) {
              changed.push({
                path: fullPath,
                mtime: stats.mtimeMs,
                size: stats.size
              });
              state.files[key] = {
                path: fullPath,
                mtime: stats.mtimeMs,
                size: stats.size
              };
            }
          } catch (e) {
            // File may have been deleted
            delete state.files[fullPath];
          }
        }
      }
    } catch (e) {
      console.error(`Error scanning ${path}:`, e);
    }
  }
  
  scan(dir);
  return changed;
}

function routeChange(file: FileState, state: WatcherState) {
  const path = file.path;
  const WORK_QUEUE = "/home/workspace/Bxthre3/WORK_QUEUE.jsonl";
  const INBOX = "/home/workspace/Bxthre3/AGENT_INBOX.md";
  
  function logToInbox(agent: string, emoji: string, message: string) {
    const timestamp = new Date().toISOString();
    const line = `### [${timestamp}] ${agent}\n${emoji} ${message}\n\n`;
    const inbox = readFileSync(INBOX, "utf-8");
    const pinnedEnd = inbox.indexOf("---\n\n## 📅 Today's Activity Log");
    if (pinnedEnd > 0) {
      const before = inbox.slice(0, pinnedEnd + 3);
      const after = inbox.slice(pinnedEnd + 3);
      writeFileSync(INBOX, before + "\n" + line + after);
    }
  }
  
  function addTask(task: any) {
    const line = JSON.stringify(task) + "\n";
    appendFileSync(WORK_QUEUE, line);
  }
  
  // Route based on file type and location
  if (path.includes("docs/") && path.includes("FarmSense")) {
    // Documentation change
    addTask({
      id: `TASK-${Date.now()}`,
      type: "doc-drift-check",
      priority: "P3",
      status: "pending",
      assignee: "alex",
      created_at: new Date().toISOString(),
      data: {
        trigger: "file-change",
        file: path,
        change_type: "modified"
      }
    });
    logToInbox("alex", "🟡", `Documentation file modified: ${path.split("/").slice(-2).join("/")} - drift check queued`);
  }
  
  if (path.includes("Investor_Materials") || path.includes("investor-materials")) {
    // Investor materials changed
    logToInbox("chronicler", "✅", `Investor materials updated: ${path.split("/").pop()}`);
  }
  
  if (path.includes("IP/") || path.includes("patent")) {
    // IP-related file
    addTask({
      id: `TASK-${Date.now()}`,
      type: "ip-claim-review",
      priority: "P2",
      status: "pending",
      assignee: "iris",
      created_at: new Date().toISOString(),
      data: {
        trigger: "file-change",
        file: path,
        change_type: "modified"
      }
    });
    logToInbox("iris", "🟡", `IP document modified: ${path.split("/").pop()} - review queued`);
  }
}

// Main
console.log(`[${new Date().toISOString()}] Starting file watcher scan...`);

const state = loadState();
const allChanges: FileState[] = [];

for (const watchPath of WATCH_PATHS) {
  const changes = scanDirectory(watchPath, state);
  allChanges.push(...changes);
  console.log(`  ${watchPath}: ${changes.length} changes`);
}

// Route all changes
for (const change of allChanges) {
  routeChange(change, state);
}

// Update state
state.last_scan = new Date().toISOString();
saveState(state);

console.log(`[${new Date().toISOString()}] Scan complete. ${allChanges.length} changes detected and routed.`);
