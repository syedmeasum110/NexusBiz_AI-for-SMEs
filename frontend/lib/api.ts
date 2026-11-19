const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function fetchJson<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const errorBody = await res.text().catch(() => "");
    throw new Error(`API error ${res.status}: ${errorBody || res.statusText}`);
  }
  return res.json();
}

// ── Types ─────────────────────────────────────────────────────────────
export interface MetricItem {
  label: string;
  value: number;
  prefix?: string;
  change?: number | null;
  change_label?: string | null;
}

export interface SalesTrendItem {
  month: string;
  year: number;
  revenue: number;
  profit: number;
  orders: number;
}

export interface InventoryAlertItem {
  item: string;
  sku?: string | null;
  status: string;
  qty: number;
  revenue_at_risk: number;
  days_of_stock_remaining?: number | null;
  recommended_reorder_qty?: number | null;
  excess_stock_qty?: number | null;
}

export interface TopProductItem {
  name: string;
  sku: string;
  sales: number;
  revenue: number;
  stock_qty: number;
  trend: string;
}

export interface WeakProductItem {
  name: string;
  sku: string;
  sales: number;
  revenue: number;
  stock_qty: number;
  reason: string;
}

export interface RecommendationItem {
  priority: string;
  title: string;
  description: string;
  expected_impact?: string;
  domain?: string;
  agent?: string;
}

export interface RecentActivityItem {
  agent: string;
  action: string;
  time: string;
  finding?: string;
}

export interface DashboardData {
  business_name: string;
  owner_name: string;
  location: string;
  currency: string;
  as_of_date: string;
  health_score: number;
  risk_level: string;
  metrics: MetricItem[];
  sales_trend: SalesTrendItem[];
  inventory_alerts: InventoryAlertItem[];
  top_products: TopProductItem[];
  weak_products: WeakProductItem[];
  recommendations: RecommendationItem[];
  recent_activity: RecentActivityItem[];
}

export interface AgentInfo {
  name: string;
  role: string;
  description: string;
  status: string;
  icon: string;
  color: string;
  tasks: string[];
  key_metrics?: string[];
}

export interface WorkflowAction {
  id: number;
  workflow_id: number;
  agent_name: string;
  title: string;
  description: string;
  action_type: string;
  financial_impact: number;
  priority: string;
  requires_approval: boolean;
  status: string;
  executed_at?: string | null;
  execution_result?: string | null;
}

export interface WorkflowStep {
  step_number: number;
  agent_name: string;
  action: string;
  finding: string;
  status: string;
  timestamp: string;
}

export interface WorkflowExecution {
  id: number;
  title: string;
  trigger_type: string;
  status: string;
  initial_trigger_detail: string;
  steps: WorkflowStep[];
  consolidated_decision: string;
  actions: WorkflowAction[];
  created_at: string;
  updated_at: string;
}

export interface CEOAnalysisResponse {
  agent: string;
  question: string;
  answer: {
    routing: {
      domain: string;
      consulted: boolean;
      reason: string;
    }[];
    consulted_agents: string[];
    health_score?: {
      score: number;
      risk_level: string;
      formula: string;
      domain_scores: {
        domain: string;
        label: string;
        score: number;
        key_signal: string;
      }[];
      weakest_domain: string;
      strongest_domain: string;
    };
    key_findings: {
      domain: string;
      agent_name: string;
      statement: string;
      severity: string;
    }[];
    root_causes: {
      id: string;
      domain: string;
      agent_name: string;
      title: string;
      explanation: string;
      evidence: string;
      financial_impact?: string;
    }[];
    recommended_actions: {
      id: string;
      priority: string;
      title: string;
      description: string;
      assigned_agent: string;
      domain: string;
      expected_impact: string;
      action_type: string;
      financial_commitment: number;
      requires_approval: boolean;
    }[];
    executive_summary: string;
  };
  interpretation: string;
  interpretation_source: string;
  generated_at: string;
}

export type AgentStatus = "idle" | "analyzing" | "working" | "completed" | "failed";

export type AgentId = "ceo" | "finance" | "inventory" | "marketing" | "support" | "bi";

export interface AgentState {
  id: AgentId;
  name: string;
  role: string;
  status: AgentStatus;
  task: string;
  preview?: string;
  result?: any;
  error?: string;
  selected?: boolean;
}

export interface OrchestrationEventData {
  workflow_id: string;
  agent_id?: AgentId;
  to_agent?: AgentId;
  status?: AgentStatus;
  message?: string;
  task?: string;
  preview?: string;
  result?: any;
  error?: string;
  selected_agents?: string[];
  unselected_agents?: string[];
  routing_details?: Record<string, string>;
  response?: CEOAnalysisResponse;
  question?: string;
  timestamp?: string;
}

export interface OrchestrationSSEEvent {
  event:
    | "workflow_started"
    | "agent_selected"
    | "agent_started"
    | "agent_progress"
    | "agent_completed"
    | "agent_failed"
    | "agent_result_received"
    | "synthesis_started"
    | "workflow_completed";
  data: OrchestrationEventData;
}


// ── API Functions ─────────────────────────────────────────────────────

export function getDashboard(): Promise<DashboardData> {
  return fetchJson<DashboardData>("/api/dashboard");
}

export function getAgents(): Promise<AgentInfo[]> {
  return fetchJson<AgentInfo[]>("/api/agents");
}

export function getFinanceAnalysis(): Promise<any> {
  return fetchJson<any>("/api/finance/analysis");
}

export function getInventoryAnalysis(): Promise<any> {
  return fetchJson<any>("/api/inventory/analysis");
}

export function getMarketingAnalysis(): Promise<any> {
  return fetchJson<any>("/api/marketing/analysis");
}

export function getSupportAnalysis(): Promise<any> {
  return fetchJson<any>("/api/support/analysis");
}

export function getBIAnalysis(): Promise<any> {
  return fetchJson<any>("/api/bi/analysis");
}

export function getCEOAnalysis(question: string): Promise<CEOAnalysisResponse> {
  return fetchJson<CEOAnalysisResponse>(`/api/ceo/analysis?question=${encodeURIComponent(question)}`);
}

export function getLatestWorkflow(): Promise<WorkflowExecution> {
  return fetchJson<WorkflowExecution>("/api/workflows/latest");
}

export function getAllWorkflows(): Promise<WorkflowExecution[]> {
  return fetchJson<WorkflowExecution[]>("/api/workflows");
}

export function triggerWorkflow(trigger_type = "demo_scenario"): Promise<WorkflowExecution> {
  return fetchJson<WorkflowExecution>("/api/workflows/trigger", {
    method: "POST",
    body: JSON.stringify({ trigger_type }),
  });
}

export function decideWorkflowAction(
  actionId: number,
  decision: "approve" | "reject",
  notes?: string
): Promise<WorkflowAction> {
  return fetchJson<WorkflowAction>(`/api/workflows/actions/${actionId}/decision`, {
    method: "POST",
    body: JSON.stringify({ decision, notes }),
  });
}

export function getActivities(agent?: string): Promise<any[]> {
  const query = agent ? `?agent=${encodeURIComponent(agent)}` : "";
  return fetchJson<any[]>(`/api/agent-activities${query}`);
}

export function getNotifications(): Promise<any[]> {
  return fetchJson<any[]>("/api/notifications");
}

export function markNotificationRead(id: number): Promise<any> {
  return fetchJson<any>(`/api/notifications/${id}/read`, { method: "POST" });
}

export function getSettings(): Promise<any> {
  return fetchJson<any>("/api/settings");
}

export function updateSettings(data: any): Promise<any> {
  return fetchJson<any>("/api/settings", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function launchDemoScenario(): Promise<{ status: string; message: string; workflow: WorkflowExecution }> {
  return fetchJson<{ status: string; message: string; workflow: WorkflowExecution }>("/api/demo/launch", {
    method: "POST",
  });
}

export function resetDemoData(): Promise<{ status: string; message: string }> {
  return fetchJson<{ status: string; message: string }>("/api/demo/reset", {
    method: "POST",
  });
}

export function streamCEOOrchestration(
  question: string,
  onEvent: (event: OrchestrationSSEEvent) => void,
  onError: (error: Error) => void,
  onComplete?: () => void
): () => void {
  const controller = new AbortController();
  const url = `${BASE_URL}/api/ceo/orchestrate?question=${encodeURIComponent(question)}`;

  (async () => {
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: "text/event-stream",
        },
      });

      if (!response.ok) {
        throw new Error(`Orchestration connection failed: ${response.status} ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error("No readable stream received from server");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const blocks = buffer.split("\n\n");
        buffer = blocks.pop() || "";

        for (const block of blocks) {
          if (!block.trim()) continue;
          let eventType = "message";
          let dataStr = "";

          const lines = block.split("\n");
          for (const line of lines) {
            if (line.startsWith("event:")) {
              eventType = line.slice(6).trim();
            } else if (line.startsWith("data:")) {
              dataStr += line.slice(5).trim();
            }
          }

          if (dataStr) {
            try {
              const parsed = JSON.parse(dataStr);
              onEvent({ event: eventType as any, data: parsed });
            } catch (err) {
              console.warn("Failed to parse SSE data packet:", dataStr, err);
            }
          }
        }
      }

      if (buffer.trim()) {
        const lines = buffer.split("\n");
        let eventType = "message";
        let dataStr = "";
        for (const line of lines) {
          if (line.startsWith("event:")) eventType = line.slice(6).trim();
          else if (line.startsWith("data:")) dataStr += line.slice(5).trim();
        }
        if (dataStr) {
          try {
            const parsed = JSON.parse(dataStr);
            onEvent({ event: eventType as any, data: parsed });
          } catch (e) {}
        }
      }

      onComplete?.();
    } catch (err: any) {
      if (err.name !== "AbortError") {
        onError(err instanceof Error ? err : new Error(String(err)));
      }
    }
  })();

  return () => {
    controller.abort();
  };
}

