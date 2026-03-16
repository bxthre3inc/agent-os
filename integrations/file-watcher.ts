#!/usr/bin/env bun
/**
 * File Watcher → Event Router
 * Monitors workspace for cha
[truncated]
() {
  if (!existsSync(STATE_FILE)) return {};
  try {
    return JSON.parse(readFileSync(STATE_FILE, "utf-8"));
  } catch {
    return {};
  }
}

function saveState(state: Record<string, number>) {
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// Calculate MD5 hash of file
function getFileHash(path: string): string | null {
  try {
    const content = readFileSync(path);
    return createHash("md5").update(content).digest("hex");
  } catch {
    return null;
  }
}

// Scan for changes
async function scanForChanges(): Promise<FileChangeEvent[]> {
  const changes: FileChangeEvent[] = [];
  const state = loadState();
  const newState: Record<string, number> = {};

  for (const [dir, config] of Object.entries(WATCHED_DIRECTORIES)) {
    if (!existsSync(dir)) continue;

    const files = glob.sync(config.pattern, { cwd: dir, absolute: true });
    
    for (const file of files) {
      try {
        const stats = statSync(file);
        const mtime = stats.mtimeMs;
        const prevMtime = state[file];
        
        newState[file] = mtime;

        if (prevMtime && mtime > prevMtime) {
          // File changed
          const relativePath = file.replace(/\/home\/workspace\//, "");
          const changeType = existsSync(file) ? "modified" : "deleted";
          
          changes.push({
            type: "file:change",
            path: relativePath,
            absolutePath: file,
            changeType,
            directory: dir,
            pattern: config.pattern,
            size: stats.size,
            mtime: new Date(mtime).toISOString(),
            timestamp: new Date().toISOString(),
          });

          // Check if this change should trigger immediate action
          for (const trigger of config.triggers) {
            if (trigger.test(relativePath)) {
              eventRouter.emit({
                ...changes[changes.length - 1],
                urgent: trigger.urgent,
                requiresReview: trigger.requiresReview,
                action: trigger.action,
              });
            }
          }
        }
      } catch (error) {
        // File may have been deleted
        if (state[file]) {
          changes.push({
            type: "file:change",
            path: file.replace(/\/home\/workspace\//, ""),
            absolutePath: file,
            changeType: "deleted",
            directory: dir,
            pattern: config.pattern,
            size: 0,
            mtime: new Date().toISOString(),
            timestamp: new Date().toISOString(),
          });
        }
      }
    }
  }

  saveState(newState);
  return changes;
}

// Main watch loop
export async function startFileWatcher(options: WatchOptions = {}) {
  const interval = options.interval || 5000; // Default 5 seconds
  
  console.log(`[File Watcher] Starting with ${interval}ms interval`);
  console.log(`[File Watcher] Watching ${Object.keys(WATCHED_DIRECTORIES).length} directories`);

  // Initial scan to establish baseline
  await scanForChanges();
  console.log("[File Watcher] Baseline established");

  // Continuous scan
  setInterval(async () => {
    const changes = await scanForChanges();
    
    if (changes.length > 0 && options.onChange) {
      for (const change of changes) {
        options.onChange(change);
      }
    }

    // Log summary if verbose
    if (options.verbose && changes.length > 0) {
      console.log(`[File Watcher] ${changes.length} changes detected:`, 
        changes.map(c => `${c.changeType}: ${c.path}`).join(", "));
    }
  }, interval);

  return {
    stop: () => {
      // In a real implementation, we'd clear the interval
      console.log("[File Watcher] Stopping (not implemented in this version)");
    },
  };
}

// Event handler registration
export function registerFileEventHandlers() {
  // Code changes → Drew
  eventRouter.on("file:change", async (event) => {
    if (event.directory.includes("farmsense-code") || event.directory.includes("zoe-project")) {
      if (event.path.endsWith(".ts") || event.path.endsWith(".js")) {
        console.log(`[Router] Code change in ${event.path} → routing to Drew`);
        
        // Trigger Drew's analysis
        const { spawn } = await import("child_process");
        spawn("bun", ["run", "agents/drew-auto.ts", "analyze", event.path], {
          detached: true,
          stdio: "ignore",
        });
      }
    }
  });

  // Doc changes → Alex
  eventRouter.on("file:change", async (event) => {
    if (event.directory.includes("docs") || event.path.endsWith(".md")) {
      if (!event.path.includes("AGENT_INBOX")) { // Skip inbox itself
        console.log(`[Router] Doc change in ${event.path} → routing to Alex`);
        
        const { spawn } = await import("child_process");
        spawn("bun", ["run", "agents/alex-auto.ts", "format", event.path], {
          detached: true,
          stdio: "ignore",
        });
      }
    }
  });

  // IP/Legal docs → Iris
  eventRouter.on("file:change", async (event) => {
    if (event.directory.includes("IP") || event.path.includes("patent") || event.path.includes("trademark")) {
      console.log(`[Router] IP document change → routing to Iris`);
      
      const { spawn } = await import("child_process");
      spawn("bun", ["run", "agents/iris-auto.ts", "monitor"], {
        detached: true,
        stdio: "ignore",
      });
    }
  });
}

// Start if run directly
if (import.meta.main) {
  registerFileEventHandlers();
  
  startFileWatcher({
    interval: 5000,
    verbose: true,
    onChange: (change) => {
      console.log(`[Watcher] ${change.changeType.toUpperCase()}: ${change.path}`);
    },
  });

  console.log("[File Watcher] Running. Press Ctrl+C to stop.");
}
