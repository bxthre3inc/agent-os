#!/usr/bin/env bun
/**
 * Risk Scoring Algorithm
 * Determines if a task can be auto-executed
 * 
 * Score = (Complexity × Impact × Reversibility)
 * 
 * Safe to auto-execute if score <= SAFE_THRESHOLD
 */

export interface Task {
  id: string;
  type: string;
  priority: "P0" | "P1" | "P2" | "P3";
  data: Record<string, unknown>;
}

export interface RiskFactors {
  complexity: number;  // 1-5 (1=simple, 5=complex)
  impact: number;      // 1-5 (1=cosmetic, 5=critical)
  reversibility: number; // 1-5 (1=irreversible, 5=easily undone)
}

export const SAFE_THRESHOLD = 15; // Max score for auto-execution

/**
 * Calculate risk score for a task
 * Lower score = safer to auto-execute
 */
export function calculateRiskScore(task: Task, factors: RiskFactors): number {
  const score = factors.complexity * factors.impact * (6 - factors.reversibility);
  // reversibility is inverted: high reversibility = low risk
  return score;
}

/**
 * Pre-defined risk factors for common task types
 */
export const TASK_RISK_PROFILES: Record<string, RiskFactors> = {
  // Formatting tasks - very safe
  "format-markdown": { complexity: 1, impact: 1, reversibility: 5 },
  "fix-typos": { complexity: 1, impact: 1, reversibility: 5 },
  "update-links": { complexity: 1, impact: 2, reversibility: 5 },
  
  // Security tasks - moderate risk
  "remove-hardcoded-secrets": { complexity: 2, impact: 4, reversibility: 3 },
  "rotate-api-key": { complexity: 3, impact: 5, reversibility: 2 },
  
  // Code tasks - higher risk
  "refactor-code": { complexity: 4, impact: 3, reversibility: 3 },
  "update-dependencies": { complexity: 3, impact: 3, reversibility: 3 },
  
  // Documentation - generally safe
  "sync-docs": { complexity: 2, impact: 2, reversibility: 5 },
  "update-specs": { complexity: 2, impact: 3, reversibility: 4 },
  
  // Infrastructure - varies
  "restart-service": { complexity: 2, impact: 4, reversibility: 4 },
  "update-config": { complexity: 2, impact: 3, reversibility: 4 },
};

/**
 * Determine if a task can be auto-executed
 */
export function canAutoExecute(task: Task): { 
  canExecute: boolean; 
  score: number; 
  reason: string;
} {
  // P0 tasks always require human approval
  if (task.priority === "P0") {
    return {
      canExecute: false,
      score: 999,
      reason: "P0 priority requires human approval",
    };
  }
  
  const profile = TASK_RISK_PROFILES[task.type];
  if (!profile) {
    return {
      canExecute: false,
      score: 999,
      reason: `Unknown task type: ${task.type}`,
    };
  }
  
  const score = calculateRiskScore(task, profile);
  const canExecute = score <= SAFE_THRESHOLD;
  
  return {
    canExecute,
    score,
    reason: canExecute 
      ? `Score ${score} <= threshold ${SAFE_THRESHOLD}` 
      : `Score ${score} > threshold ${SAFE_THRESHOLD}`,
  };
}

// CLI usage
if (import.meta.main) {
  const taskType = process.argv[2] || "format-markdown";
  const priority = (process.argv[3] || "P2") as Task["priority"];
  
  const testTask: Task = {
    id: "TEST-001",
    type: taskType,
    priority,
    data: {},
  };
  
  const result = canAutoExecute(testTask);
  console.log(`\nTask: ${taskType} (${priority})`);
  console.log(`Score: ${result.score}`);
  console.log(`Auto-execute: ${result.canExecute ? "✅ YES" : "❌ NO"}`);
  console.log(`Reason: ${result.reason}`);
  console.log();
}
