import { readFileSync, writeFileSync, appendFileSync, existsSync } from "fs";

/**
 * Streaming Briefing Engine
 * Real-time updates as work completes
 */

interface BriefingEntry {
  timestamp: string;
  type: string;
  priority: string;
  summary: string;
  details?: Record<string, unknown>;
}

interface StreamingOptions {
  inboxPath: string;
  maxEntries: number;
  flushInterval: number;
}

export class StreamingBriefing {
  private buffer: BriefingEntry[] = [];
  private options: StreamingOptions;
  private flushTimer: Timer | null = null;
  
  constructor(options: Partial<StreamingOptions> = {}) {
    this.options = {
      inboxPath: "/home/workspace/Bxthre3/AGENT_INBOX.md",
      maxEntries: 100,
      flushInterval: 5000, // 5 seconds
      ...options,
    };
  }
  
  start() {
    // Periodic flush to inbox
    this.flushTimer = setInterval(() => this.flush(), this.options.flushInterval);
    console.log(`[StreamingBriefing] Started (flush interval: ${this.options.flushInterval}ms)`);
  }
  
  stop() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    this.flush(); // Final flush
  }
  
  update(entry: BriefingEntry) {
    this.buffer.push(entry);
    
    // Keep buffer size manageable
    if (this.buffer.length > this.options.maxEntries) {
      this.buffer = this.buffer.slice(-this.options.maxEntries);
    }
    
    // Immediate flush for P1 items
    if (entry.priority === "P1") {
      this.flush();
    }
  }
  
  flush() {
    if (this.buffer.length === 0) return;
    
    const entries = [...this.buffer];
    this.buffer = [];
    
    // Format entries
    const formatted = entries.map(e => {
      const time = new Date(e.timestamp).toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" });
      const emoji = e.priority === "P1" ? "🔴" : e.priority === "P2" ? "🟡" : "🟢";
      return `**${time}** ${emoji} ${e.summary}`;
    }).join("\n");
    
    // Update inbox with real-time section
    try {
      if (!existsSync(this.options.inboxPath)) {
        console.error(`[StreamingBriefing] Inbox not found: ${this.options.inboxPath}`);
        return;
      }
      
      const inbox = readFileSync(this.options.inboxPath, "utf-8");
      
      // Find or create real-time section
      const rtMarker = "## ⚡ REAL-TIME STREAM";
      const activityMarker = "## 📅 Today's Activity Log";
      
      let newInbox: string;
      
      if (inbox.includes(rtMarker)) {
        // Update existing section
        const beforeRt = inbox.split(rtMarker)[0];
        const afterActivity = inbox.split(activityMarker)[1] || "";
        
        newInbox = `${beforeRt}${rtMarker}\n*Last updated: ${new Date().toISOString()}*\n\n${formatted}\n\n---\n\n${activityMarker}${afterActivity}`;
      } else {
        // Insert new section
        const beforeActivity = inbox.split(activityMarker)[0];
        const afterActivity = inbox.split(activityMarker)[1] || "";
        
        newInbox = `${beforeActivity}${rtMarker}\n*Last updated: ${new Date().toISOString()}*\n\n${formatted}\n\n---\n\n${activityMarker}${afterActivity}`;
      }
      
      writeFileSync(this.options.inboxPath, newInbox);
      console.log(`[StreamingBriefing] Flushed ${entries.length} entries to inbox`);
      
    } catch (error) {
      console.error("[StreamingBriefing] Failed to update inbox:", error);
    }
  }
  
  getRecentEntries(minutes: number = 5): BriefingEntry[] {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000).toISOString();
    return this.buffer.filter(e => e.timestamp >= cutoff);
  }
}

// Singleton instance
export const streamingBriefing = new StreamingBriefing();
