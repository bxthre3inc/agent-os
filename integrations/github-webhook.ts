#!/usr/bin/env bun
/**
 * GitHub Webhook → Event Router
 * 
[truncated]

      case "pull_request":
        if (["opened", "synchronize", "closed", "merged"].includes(event.actio
[truncated]
 payload);
        break;

      case "issues":
        if (["opened", "closed", "labeled"].includes(event.action)) {
          eventRouter.emit({
            type: "github:issue",
            repository: event.repository.full_name,
            issue: event.issue,
            action: event.action,
            timestamp: new Date().toISOString(),
          });
        }
        break;

      case "release":
        eventRouter.emit({
          type: "github:release",
          repository: event.repository.full_name,
          release: event.release,
          timestamp: new Date().toISOString(),
        });
        break;

      case "workflow_run":
        if (event.action === "completed" && event.workflow_run.conclusion === "failure") {
          eventRouter.emit({
            type: "github:ci-failure",
            repository: event.repository.full_name,
            workflow: event.workflow_run.name,
            run_id: event.workflow_run.id,
            timestamp: new Date().toISOString(),
          });
        }
        break;
    }

    return { success: true, event: eventType };
  } catch (error) {
    console.error("[GitHub Webhook] Error processing webhook:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

// Hono middleware for the webhook endpoint
export function githubWebhookMiddleware() {
  return async (c: { req: { text: () => Promise<string>; header: (name: string) => string | undefined }; json: (data: unknown, status?: number) => Response }) => {
    const signature = c.req.header("x-hub-signature-256") || c.req.header("x-hub-signature");
    const eventType = c.req.header("x-github-event");
    const body = await c.req.text();
    
    const result = await processGitHubWebhook(body, signature, eventType);
    
    if (result.success) {
      return c.json({ received: true, event: result.event });
    } else {
      return c.json({ error: result.error }, 400);
    }
  };
}

// CLI test
if (import.meta.main) {
  console.log("GitHub Webhook Handler ready");
  console.log("Test: bun run integrations/github-webhook.ts");
}
