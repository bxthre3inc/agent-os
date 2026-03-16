import { useState, useEffect } from "react";

export default function AgentOS() {
  const [trainingWheels, setTrainingWheels] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  
  const agents = [
    { name: "Erica", role: "Executive Briefing", status: "active", tasks: 2 },
    { name: "Pulse", role: "System Monitor", status: "active", tasks: 0 },
    { name: "Sentinel", role: "Security Watch", status: "active", tasks: 1 },
    { name: "Alex", role: "Documentation", status: "idle", tasks: 0 },
    { name: "Drew", role: "Engineering", status: "active", tasks: 3 },
    { name: "Casey", role: "Grants", status: "active", tasks: 1 }
  ];

  useEffect(() => {
    fetch("/api/aos/proposals")
      .then(r => r.json())
      .then(data => {
        if (data.proposals) setProposals(data.proposals);
      })
      .catch(() => setProposals([
        { id: "PROP-001", agent: "Alex", title: "Fix typo in README", risk: 2, status: "pending", file: "README.md" },
        { id: "PROP-002", agent: "Sentinel", title: "Update dev secrets warning", risk: 15, status: "pending", file: "start-with-env.sh" }
      ]));
    
    fetch("/api/aos/settings")
      .then(r => r.json())
      .then(data => {
        if (data.safety?.trainingWheelsMode !== undefined) {
          setTrainingWheels(data.safety.trainingWheelsMode);
        }
      })
      .catch(() => {});
  }, []);

  const handleProposalAction = async (proposalId, action) => {
    setLoading(true);
    try {
      const res = await fetch("/api/aos/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, proposalId })
      });
      const data = await res.json();
      if (data.success) {
        setProposals(proposals.map(p => p.id === proposalId ? { ...p, status: action } : p));
        setMessage(`✅ Proposal ${action}d successfully`);
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (err) {
      setMessage("❌ Failed to update proposal");
    }
    setLoading(false);
  };

  const updateSettings = async (newSettings) => {
    setLoading(true);
    try {
      const res = await fetch("/api/aos/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSettings)
      });
      const data = await res.json();
      if (data.success) {
        setMessage("✅ Settings saved");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (err) {
      setMessage("❌ Failed to save settings");
    }
    setLoading(false);
  };

  const toggleTrainingWheels = () => {
    const newValue = !trainingWheels;
    setTrainingWheels(newValue);
    updateSettings({ safety: { trainingWheelsMode: newValue, dryRunMode: newValue } });
  };

  const renderOverview = () => {
    const activeCount = agents.filter(a => a.status === "active").length;
    const pendingCount = proposals.filter(p => p.status === "pending").length;
    const safeCount = proposals.filter(p => p.risk <= 15).length;
    
    return (
      <div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "15px", marginBottom: "20px" }}>
          <StatBox label="Active Agents" value={activeCount} color="#4ade80" />
          <StatBox label="Pending Proposals" value={pendingCount} color="#fbbf24" />
          <StatBox label="Completed Today" value={0} color="#60a5fa" />
          <StatBox label="Safe Auto-Exec" value={safeCount} color="#a78bfa" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
          <SafetyCard trainingWheels={trainingWheels} />
          <QuickActionsCard onReview={() => setActiveTab("proposals")} pendingCount={pendingCount} />
        </div>
      </div>
    );
  };

  const renderProposals = () => {
    return (
      <div>
        <p style={{ color: "#888", marginBottom: "15px" }}>
          Proposals are like Pull Requests from agents. Review and approve changes.
        </p>
        
        {proposals.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>
            No proposals yet. Agents will create them as they detect changes.
          </div>
        ) : (
          proposals.map(prop => (
            <ProposalCard 
              key={prop.id} 
              proposal={prop} 
              loading={loading} 
              onAction={handleProposalAction} 
            />
          ))
        )}
      </div>
    );
  };

  const renderAgents = () => (
    <div style={{ display: "grid", gap: "10px" }}>
      {agents.map(agent => <AgentCard key={agent.name} agent={agent} />)}
    </div>
  );

  const renderSettings = () => (
    <div style={{ background: "#1f1f1f", padding: "20px", borderRadius: "8px", border: "1px solid #333" }}>
      <h3 style={{ margin: "0 0 20px 0" }}>⚙️ System Configuration</h3>
      
      <div style={{ marginBottom: "20px" }}>
        <label style={{ display: "block", marginBottom: "5px", color: "#888" }}>Training Wheels Mode</label>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button 
            onClick={() => { setTrainingWheels(true); updateSettings({ safety: { trainingWheelsMode: true, dryRunMode: true } }); }}
            disabled={loading}
            style={{
              padding: "10px 20px",
              background: trainingWheels ? "#4ade80" : "#1f1f1f",
              color: trainingWheels ? "#000" : "#fff",
              border: "1px solid #444",
              borderRadius: "6px",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1
            }}
          >
            ON (Safe)
          </button>
          <button 
            onClick={() => { setTrainingWheels(false); updateSettings({ safety: { trainingWheelsMode: false, dryRunMode: false } }); }}
            disabled={loading}
            style={{
              padding: "10px 20px",
              background: !trainingWheels ? "#ef4444" : "#1f1f1f",
              color: "#fff",
              border: "1px solid #444",
              borderRadius: "6px",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1
            }}
          >
            OFF (Live)
          </button>
        </div>
        <p style={{ marginTop: "10px", fontSize: "14px", color: "#888" }}>
          When ON: Agents simulate changes. No files modified. Review proposals before approval.
        </p>
      </div>

      <div style={{ padding: "15px", background: "#0f0f0f", borderRadius: "6px", border: "1px solid #333" }}>
        <h4 style={{ margin: "0 0 10px 0" }}>🔒 Critical File Protections (Always Active)</h4>
        <ul style={{ margin: 0, paddingLeft: "20px", color: "#888", fontSize: "14px" }}>
          <li>.env files — Always require manual approval</li>
          <li>*.secret.* — Always require manual approval</li>
          <li>deploy scripts — Always require manual approval</li>
          <li>*.pem, *.key — Always require manual approval</li>
        </ul>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f0f", color: "white", padding: "20px" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", paddingBottom: "20px", borderBottom: "1px solid #333" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "28px" }}>🤖 Agent OS Control Center</h1>
            <p style={{ margin: "5px 0 0 0", color: "#888", fontSize: "14px" }}>
              Phase 1.2 Complete | {trainingWheels ? "Training Wheels ON" : "Full Autonomy"}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ color: trainingWheels ? "#fbbf24" : "#4ade80", fontSize: "14px" }}>
              {trainingWheels ? "⚠️ Training Wheels" : "✅ Full Autonomy"}
            </span>
            <button 
              onClick={toggleTrainingWheels}
              disabled={loading}
              style={{ 
                padding: "8px 16px", 
                background: trainingWheels ? "#fbbf24" : "#4ade80",
                color: "#000",
                border: "none",
                borderRadius: "6px",
                cursor: loading ? "not-allowed" : "pointer",
                fontWeight: "bold",
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? "Saving..." : trainingWheels ? "Disable Safety" : "Enable Safety"}
            </button>
          </div>
        </div>

        {message && (
          <div style={{ marginBottom: "15px", padding: "10px 15px", background: message.startsWith("✅") ? "#4ade80" : "#ef4444", color: message.startsWith("✅") ? "#000" : "#fff", borderRadius: "6px" }}>
            {message}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          {["overview", "agents", "proposals", "settings"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "10px 20px",
                background: activeTab === tab ? "#3b82f6" : "#1f1f1f",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                textTransform: "capitalize"
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === "overview" && renderOverview()}
        {activeTab === "agents" && renderAgents()}
        {activeTab === "proposals" && renderProposals()}
        {activeTab === "settings" && renderSettings()}
      </div>
    </div>
  );
}

function StatBox({ label, value, color }) {
  return (
    <div style={{ background: "#1f1f1f", padding: "20px", borderRadius: "8px", border: "1px solid #333" }}>
      <div style={{ color: "#888", fontSize: "12px" }}>{label}</div>
      <div style={{ fontSize: "32px", fontWeight: "bold", color }}>{value}</div>
    </div>
  );
}

function SafetyCard({ trainingWheels }) {
  return (
    <div style={{ background: "#1f1f1f", padding: "20px", borderRadius: "8px", border: "1px solid #333" }}>
      <h3 style={{ margin: "0 0 15px 0" }}>🔒 Safety Status</h3>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #333" }}>
        <span>Training Wheels</span>
        <span style={{ color: trainingWheels ? "#4ade80" : "#ef4444" }}>{trainingWheels ? "ON" : "OFF"}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #333" }}>
        <span>Dry Run Mode</span>
        <span style={{ color: trainingWheels ? "#4ade80" : "#ef4444" }}>{trainingWheels ? "SIMULATING" : "LIVE"}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0" }}>
        <span>Risk Threshold</span>
        <span style={{ color: "#60a5fa" }}>≤15</span>
      </div>
      {trainingWheels && (
        <div style={{ marginTop: "15px", padding: "10px", border: "1px solid #fbbf24", borderRadius: "6px", color: "#fbbf24", fontSize: "14px" }}>
          ⚠️ Agents are simulating changes. No actual modifications made.
        </div>
      )}
    </div>
  );
}

function QuickActionsCard({ onReview, pendingCount }) {
  return (
    <div style={{ background: "#1f1f1f", padding: "20px", borderRadius: "8px", border: "1px solid #333" }}>
      <h3 style={{ margin: "0 0 15px 0" }}>⚡ Quick Actions</h3>
      <button style={{ width: "100%", padding: "12px", marginBottom: "10px", background: "#3b82f6", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}>
        Trigger Sprint (Dry Run)
      </button>
      <button style={{ width: "100%", padding: "12px", marginBottom: "10px", background: "#1f1f1f", color: "white", border: "1px solid #444", borderRadius: "6px", cursor: "pointer" }}>
        View Agent Inbox
      </button>
      <button onClick={onReview} style={{ width: "100%", padding: "12px", background: "#1f1f1f", color: "white", border: "1px solid #444", borderRadius: "6px", cursor: "pointer" }}>
        Review Proposals ({pendingCount})
      </button>
    </div>
  );
}

function AgentCard({ agent }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#1f1f1f", padding: "15px", borderRadius: "8px", border: "1px solid #333" }}>
      <div>
        <div style={{ fontWeight: "bold" }}>{agent.name}</div>
        <div style={{ color: "#888", fontSize: "14px" }}>{agent.role}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        <span style={{ 
          padding: "4px 12px", 
          borderRadius: "4px", 
          fontSize: "12px",
          background: agent.status === "active" ? "#4ade80" : "#6b7280",
          color: agent.status === "active" ? "#000" : "#fff"
        }}>
          {agent.status}
        </span>
        <span style={{ color: "#888" }}>{agent.tasks} tasks</span>
      </div>
    </div>
  );
}

function ProposalCard({ proposal, loading, onAction }) {
  const riskColor = proposal.risk <= 15 ? "#4ade80" : proposal.risk <= 30 ? "#fbbf24" : "#ef4444";
  const statusBg = proposal.status === "approved" ? "#4ade80" : proposal.status === "rejected" ? "#ef4444" : "#fbbf24";
  
  return (
    <div style={{ background: "#1f1f1f", padding: "15px", borderRadius: "8px", border: "1px solid #333", marginBottom: "10px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
        <div>
          <div style={{ fontWeight: "bold" }}>{proposal.title}</div>
          <div style={{ color: "#888", fontSize: "14px" }}>{proposal.agent} • {proposal.file}</div>
        </div>
        <span style={{ 
          padding: "4px 12px", 
          borderRadius: "4px", 
          fontSize: "12px",
          background: statusBg,
          color: "#000"
        }}>
          {proposal.status}
        </span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "15px", fontSize: "14px" }}>
          <span style={{ color: riskColor }}>Risk: {proposal.risk}/100</span>
          <span style={{ color: "#888" }}>ID: {proposal.id}</span>
        </div>
        {proposal.status === "pending" && (
          <div style={{ display: "flex", gap: "10px" }}>
            <button 
              onClick={() => onAction(proposal.id, "approve")}
              disabled={loading}
              style={{ padding: "6px 16px", background: "#4ade80", color: "#000", border: "none", borderRadius: "4px", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1 }}
            >
              {loading ? "..." : "Approve"}
            </button>
            <button 
              onClick={() => onAction(proposal.id, "reject")}
              disabled={loading}
              style={{ padding: "6px 16px", background: "#ef4444", color: "white", border: "none", borderRadius: "4px", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1 }}
            >
              {loading ? "..." : "Reject"}
            </button>
            <button style={{ padding: "6px 16px", background: "#1f1f1f", color: "white", border: "1px solid #444", borderRadius: "4px", cursor: "pointer" }}>
              View
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
