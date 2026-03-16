/**
 * Sprint Templates
 * Pre-defined sprint configurations f
[truncated]
tSprint {
  return {
    id: `EVENING-${today()}`,
    window: { start: "16:00", end: "17:00" },
    departments: [
      { dept: "content", lead: "alex", tasks: ["deep-spec-work", "doc-drafting"], estimated_minutes: 30, deliverables: ["specs-drafted.md"], escalation_threshold: "immediate" },
      { dept: "engineering", lead: "drew", tasks: ["architectural-decisions", "complex-refactoring"], estimated_minutes: 30, deliverables: ["arch-decisions.md"], escalation_threshold: "immediate" },
    ],
    parallelize: true,
    checkpoint_every_minutes: 5,
  };
}

export function getSprintTemplate(type: SprintType): Sprint {
  switch (type) {
    case "overnight": return getOvernightSprint();
    case "evening": return getEveningSprint();
    default: throw new Error(`Unknown sprint type: ${type}`);
  }
}
