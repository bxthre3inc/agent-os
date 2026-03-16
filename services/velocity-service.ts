#!/usr/bin/env bun
/**
 * Velocity Service - Runs TRUE Optimization Layer
 * 
[truncated]
        clearInterval(this.heartbeatTimer);
        this.heartbeatTimer = null;
      }
      console.log("[VelocityService] Stopped");
    }
  }
}

// Singleton
export const velocityService = new VelocityService();

// Start if run directly
if (import.meta.main) {
  velocityService.start();
  
  // Graceful shutdown
  process.on("SIGINT", () => {
    console.log("\n[VelocityService] Shutting down...");
    velocityService.stop();
    process.exit(0);
  });
  
  process.on("SIGTERM", () => {
    velocityService.stop();
    process.exit(0);
  });
}
