#!/usr/bin/env bun
/**
 * Briefing Compiler (Erica)
 * Aggregates all department sprint outp
[truncated]
Type: ${sprint.type.toUpperCase()}
Duration: ${sprint.actual_duration_minutes} minutes
Departments: ${sprint.departments.length}
Tasks Completed: ${totalCompleted}
Compute Used: ${sprint.actual_duration_minutes} minutes wall time

${sprint.departments.map(renderDepartment).join("\n\n")}

ESCALATIONS REQUIRING HUMAN (${escalations.length} items):
${escalations.length === 0 ? "✅ None! All clear." : escalations.map(e => `${e.severity}: ${e.message}`).join("\n")}

AUTO-ACTIONS TAKEN (${autoActions.length} items):
${autoActions.length === 0 ? "⚪ None." : autoActions.map(a => `✅ ${a.description}`).join("\n")}

NEXT SPRINT: ${getNextSprintType(sprint.type)} at ${getNextSprintTime(sprint.type)}
Focus: ${getNextSprintFocus(sprint.type)}

═══════════════════════════════════════
`;
}

function getNextSprintType(current: SprintType): string {
  return current === "overnight" ? "Daytime/Evening" : "Overnight";
}

function getNextSprintTime(current: SprintType): string {
  return current === "overnight" ? "16:00 UTC" : "22:00 UTC";
}
}

function getNextSprintFocus(current: SprintType): string {
  return current === "overnight" ? "Deep work on escalated items" : "Full department parallel execution";
}

// CLI
if (import.meta.main) {
  const sprintId = process.argv[2];
  if (!sprintId) {
    console.log("Usage: bun core/briefing-compiler.ts <sprint-id>");
    process.exit(1);
  }
  const briefing = compileBriefing(sprintId);
  console.log(briefing);
  
  // Also write to INBOX
  const inboxEntry = `\n### [${new Date().toISOString()}] Erica\n${briefing}\n`;
  appendFileSync(INBOX, inboxEntry);
  console.log("\n✅ Briefing appended to AGENT_INBOX.md");
}
