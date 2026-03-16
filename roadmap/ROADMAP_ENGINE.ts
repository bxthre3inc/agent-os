#!/usr/bin/env bun
/**
[truncated]
if (!dep
[truncated]
 this.employees[empId].hourly_schedule
      .filter(task => task.time === hour)
      .map(task => ({
        ...task,
        priority: this.getTaskPriority(empId, task),
        blockers: this.getBlockers(empId, task)
      }))
      .sort((a, b) => b.priority - a.priority);
  }

  /**
   * Get current priorities for all employees
   */
  getCurrentPriorities(): PriorityView[] {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    
    return Object.values(this.employees).map(emp => {
      const hourly = this.getHourlySchedule(emp.id, hour);
      const daily = emp.daily_schedule || [];
      const weekly = emp.weekly_focus;
      
      // Check dependencies
      const blockedTasks = hourly.filter(t => 
        t.blockers && t.blockers.length > 0
      );
      
      return {
        employee: emp.id,
        role: emp.role,
        current_hour_tasks: hourly,
        daily_progress: this.calculateDailyProgress(emp.id, day),
        weekly_progress: this.calculateWeeklyProgress(emp.id),
        blocked_count: blockedTasks.length,
        next_dependency_check: this.getNextDependencyCheck(emp.id),
        escalation_needed: blockedTasks.length > 2
      };
    });
  }

  /**
   * Calculate how blocked an employee is
   */
  getBlockers(empId: string, task: HourlyTask): Blocker[] {
    const blockers: Blocker[] = [];
    const emp = this.employees[empId];
    
    if (!emp.dependencies) return blockers;
    
    // Check if task requires something from another employee
    for (const [provider, needs] of Object.entries(emp.dependencies.needs_from || {})) {
      if (task.name.toLowerCase().includes(needs.toLowerCase())) {
        // Check if provider has delivered
        const providerStatus = this.getEmployeeStatus(provider);
        if (!providerStatus.deliverables.includes(needs)) {
          blockers.push({
            type: 'dependency',
            from: provider,
            what: needs,
            since: providerStatus.last_update,
            escalation_ready: Date.now() - providerStatus.last_update > 24 * 60 * 60 * 1000 // 24 hours
          });
        }
      }
    }
    
    return blockers;
  }

  /**
   * Generate daily briefing for employee
   */
  generateDailyBriefing(empId: string): Briefing {
    const emp = this.employees[empId];
    const dept = this.getEmployeeDepartment(empId);
    const strategic = this.strategic.pillars[dept?.strategic_alignment];
    
    const today = new Date().toISOString().split('T')[0];
    
    return {
      employee: emp.id,
      role: emp.role,
      date: today,
      
      strategic_context: {
        company_goal: this.strategic.mission,
        department_goal: strategic?.objective,
        personal_goal: emp.strategic_goal
      },
      
      todays_schedule: emp.daily_schedule || [],
      
      priorities: {
        p0_must_complete: this.getP0Tasks(empId),
        p1_should_complete: this.getP1Tasks(empId),
        p2_if_time: this.getP2Tasks(empId)
      },
      
      dependencies: {
        waiting_on: this.getWaitingOn(empId),
        providing_to: this.getProvidingTo(empId),
        escalations_needed: this.getEscalations(empId)
      },
      
      blockers: this.getAllBlockers(empId),
      
      success_criteria: {
        if_i_do_nothing_else: emp.daily_schedule?.slice(0, 3) || [],
        end_of_day_check: strategic?.success_metric
      }
    };
  }

  /**
   * Check if employee is on track for weekly goals
   */
  getWeeklyStatus(empId: string): WeeklyStatus {
    const emp = this.employees[empId];
    const weekDeliverables = emp.weekly_focus?.deliverables || [];
    
    const completed = weekDeliverables.filter(d => 
      this.isDeliverableComplete(empId, d)
    );
    
    const remaining = weekDeliverables.filter(d => 
      !this.isDeliverableComplete(empId, d)
    );
    
    const daysLeft = 7 - new Date().getDay();
    const velocity = completed.length / (7 - daysLeft || 1);
    const onTrack = velocity >= (weekDeliverables.length / 7);
    
    return {
      employee: empId,
      week: emp.weekly_focus?.week,
      completed: completed.length,
      total: weekDeliverables.length,
      remaining,
      days_left: daysLeft,
      on_track: onTrack,
      risk_level: onTrack ? 'green' : daysLeft > 3 ? 'yellow' : 'red'
    };
  }

  // Helper methods
  private getTaskPriority(empId: string, task: HourlyTask): number {
    if (task.type === 'p0') return 100;
    if (task.type === 'p1') return 50;
    if (task.name.includes('deadline')) return 75;
    return 10;
  }

  private getEmployeeStatus(empId: string): EmployeeStatus {
    // Would query from live system
    return {
      id: empId,
      last_update: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
      deliverables: [],
      current_task: 'unknown'
    };
  }

  private calculateDailyProgress(empId: string, day: number): number {
    // Implementation would check completed tasks
    return 0.5; // 50% placeholder
  }

  private calculateWeeklyProgress(empId: string): number {
    // Implementation would check weekly deliverables
    return 0.3; // 30% placeholder
  }

  private getNextDependencyCheck(empId: string): string {
    const emp = this.employees[empId];
    if (!emp.dependencies) return 'none';
    
    const providers = Object.keys(emp.dependencies.needs_from || {});
    if (providers.length === 0) return 'none';
    
    return providers[0]; // Next person to check with
  }

  private getP0Tasks(empId: string): string[] {
    return this.getTodaysTasks(empId).filter(t => t.priority >= 80).map(t => t.name);
  }

  private getP1Tasks(empId: string): string[] {
    return this.getTodaysTasks(empId).filter(t => t.priority >= 40 && t.priority < 80).map(t => t.name);
  }

  private getP2Tasks(empId: string): string[] {
    return this.getTodaysTasks(empId).filter(t => t.priority < 40).map(t => t.name);
  }

  private getTodaysTasks(empId: string): TaskWithPriority[] {
    const emp = this.employees[empId];
    return (emp.daily_schedule || []).map(task => ({
      ...task,
      priority: this.getTaskPriority(empId, task)
    }));
  }

  private getWaitingOn(empId: string): string[] {
    const emp = this.employees[empId];
    return Object.keys(emp.dependencies?.needs_from || {});
  }

  private getProvidingTo(empId: string): string[] {
    const emp = this.employees[empId];
    return Object.keys(emp.dependencies?.provides_to || {});
  }

  private getEscalations(empId: string): Escalation[] {
    const blockers = this.getAllBlockers(empId);
    return blockers.filter(b => b.escalation_ready).map(b => ({
      blocker: b,
      to: 'maya', // Escalate to department head
      reason: `Blocked by ${b.from} for >24 hours`
    }));
  }

  private getAllBlockers(empId: string): Blocker[] {
    const emp = this.employees[empId];
    const blockers: Blocker[] = [];
    
    // Check hourly tasks for blockers
    const hour = new Date().getHours();
    const tasks = this.getHourlySchedule(empId, hour);
    
    for (const task of tasks) {
      blockers.push(...this.getBlockers(empId, task));
    }
    
    return blockers;
  }

  private isDeliverableComplete(empId: string, deliverable: string): boolean {
    // Would check git commits, file changes, etc.
    return false;
  }

  private getEmployeeDepartment(empId: string): Department | null {
    for (const dept of Object.values(this.departments)) {
      // Check if empId is in department (simplified)
      if (dept.head.toLowerCase() === empId || 
          dept.employees?.includes(empId)) {
        return dept;
      }
    }
    return null;
  }

  /**
   * Generate company-wide status report
   */
  generateCompanyStatus(): CompanyStatus {
    const priorities = this.getCurrentPriorities();
    
    return {
      date: new Date().toISOString(),
      company: this.strategic.company,
      
      strategic_progress: {
        pillars: Object.entries(this.strategic.pillars).map(([key, pillar]) => ({
          name: key,
          objective: pillar.objective,
          owner: pillar.owner,
          priority: pillar.priority,
          on_track: this.isPillarOnTrack(key)
        }))
      },
      
      department_status: Object.values(this.departments).map(dept => ({
        name: dept.department,
        head: dept.head,
        weekly_focus: dept.weekly_sprints?.focus,
        completion_rate: this.calculateDeptCompletion(dept)
      })),
      
      employee_status: priorities,
      
      critical_blockers: priorities
        .filter(p => p.escalation_needed)
        .map(p => ({
          employee: p.employee,
          blocked_tasks: p.blocked_count,
          waiting_on: p.next_dependency_check
        })),
      
      upcoming_deadlines: Object.entries(this.strategic.critical_dates || {})
        .filter(([date]) => new Date(date) > new Date())
        .slice(0, 5)
    };
  }

  private isPillarOnTrack(pillarKey: string): boolean {
    // Check if employees aligned to this pillar are on track
    return true; // Placeholder
  }

  private calculateDeptCompletion(dept: Department): number {
    // Calculate % of weekly deliverables complete
    return 0.5; // Placeholder
  }
}

// Export singleton
export const roadmapEngine = new RoadmapEngine();

// Example usage
if (import.meta.main) {
  console.log('🗺️ Roadmap Engine Test\n');
  
  // Generate Casey's daily briefing
  const caseyBriefing = roadmapEngine.generateDailyBriefing('casey');
  console.log('Casey\'s Daily Briefing:');
  console.log(JSON.stringify(caseyBriefing, null, 2));
  
  // Get current priorities for all
  console.log('\n\nCurrent Priorities:');
  const priorities = roadmapEngine.getCurrentPriorities();
  console.log(JSON.stringify(priorities, null, 2));
  
  // Company status
  console.log('\n\nCompany Status:');
  const status = roadmapEngine.generateCompanyStatus();
  console.log(JSON.stringify(status, null, 2));
}
