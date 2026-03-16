#!/usr/bin/env bun
/**
 * Agent OS Test Harness
 * Safe testing environment for agent behaviors
 */

import { existsSync, readFileSync, writeFileSync, mkdi
[truncated]
      writeFileSync(testQueue, JSON.stringify(testTasks) + "\n");
    }
    
    console.log(`✅ Test task created: ${taskId}`);
    console.log(`   Queue: ${testQueue}`);
    console.log(`   Inbox: ${testInbox}`);
    console.log("\n💡 Tip: Edit the task JSON to test different scenarios");
    
  } else if (command === "run-agent") {
    const agentName = args[1];
    if (!agentName) {
      console.error("Usage: bun run-agent <agent-name>");
      process.exit(1);
    }
    
    const instructionFile = `../agents/instructions/${agentName}.md`;
    if (!existsSync(instructionFile)) {
      console.error(`❌ Agent ${agentName} not found`);
      process.exit(1);
    }
    
    console.log(`🧪 Running ${agentName} in test mode...`);
    console.log(`   Instructions: ${instructionFile}`);
    console.log(`   Queue: ${testQueue}`);
    console.log(`   Inbox: ${testInbox}`);
    console.log("\n⚠️  This will execute agent logic against TEST data only");
    console.log("   Review the task queue and inbox after execution");
    
  } else if (command === "cleanup") {
    if (existsSync(testDir)) {
      // Would need fs.rmSync for recursive delete, keeping simple
      console.log("🧹 To cleanup manually:");
      console.log(`   rm -rf ${testDir}`);
    }
  } else {
    console.log("Agent OS Test Harness");
    console.log("");
    console.log("Commands:");
    console.log("  init                    - Create test environment");
    console.log("  create-task <agent>     - Add a test task for agent");
    console.log("  run-agent <agent>       - Simulate agent execution");
    console.log("  cleanup                 - Remove test environment");
    console.log("");
    console.log("Example workflow:");
    console.log("  bun tests/agent-test-harness.ts init");
    console.log("  bun tests/agent-test-harness.ts create-task sentinel");
    console.log("  # Review test data in tests/fixtures/");
    console.log("  bun tests/agent-test-harness.ts run-agent sentinel");
  }
}

main();
