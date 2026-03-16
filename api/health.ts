import type { Context } from "hono";
import { existsSync, readFileSync } from "fs";

/**
 * Health Check Endpoint
 * GET /api/health
 * Returns system status for monitoring
 */

const INBOX = "/home/workspace/Bxthre3/AGENT_INBOX.md";
const QUEUE = "/home/workspace/Bxthre3/WORK_QUEUE.jsonl";

export default (c: Context) => {
  const checks = {
    inbox: existsSync(INBOX),
    queue: existsSync(QUEUE),
    timestamp: new Date().toISOString(),
  };
  
  // Count active tasks
  let pendingTasks = 0;
  let p0Tasks = 0;
  
  if (checks.queue) {
    const lines = readFileSync(QUEUE, "utf-8").trim().split("\n");
    for (const line of lines) {
      if (!line || line.startsWith("#")) continue;
      try {
        const task = JSON.parse(line);
        if (task.status === "pending") pendingTasks++;
        if (task.priority === "P0" && task.status !== "completed") p0Tasks++;
      } catch {}
    }
  }
  
  const healthy = checks.inbox && checks.queue;
  
  return c.json({
    status: healthy ? "healthy" : "degraded",
    version: "1.0",
    checks,
    metrics: {
      pendingTasks,
      p0Tasks,
    },
  }, healthy ? 200 : 503);
};
