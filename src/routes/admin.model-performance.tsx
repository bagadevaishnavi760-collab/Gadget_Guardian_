import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Target, Zap } from "lucide-react";

export const Route = createFileRoute("/admin/model-performance")({
  head: () => ({
    meta: [
      { title: "Model Performance — Gadget Guardian" },
      {
        name: "description",
        content: "Model performance metrics and feature information.",
      },
    ],
  }),
  component: AdminModelPerformance,
});

function AdminModelPerformance() {
  const modelFeatures = [
    "Gadget_Type",
    "Age_Years",
    "Daily_Usage_Hours",
    "Battery_Health_Percent",
    "Charge_Cycles",
    "Overheating_Level",
    "Physical_Condition",
    "Maintenance_Frequency",
    "Repair_Count",
    "Performance_Score",
    "Storage_Used_Percent",
    "Software_Updated",
    "Environment_Stress",
    "Expected_Life_Months",
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Model Performance</h1>
        <p className="mt-2 text-muted-foreground">
          Model evaluation metrics and feature information
        </p>
      </div>

      <Card className="mb-6 rounded-2xl shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="size-5 text-primary" />
            Model Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Model Type</p>
              <p className="text-lg font-semibold">Multiple Linear Regression</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Target Variable</p>
              <p className="text-lg font-semibold">Remaining_Lifespan_Months</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Model Library</p>
              <p className="text-lg font-semibold">scikit-learn (sklearn.pipeline.Pipeline)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6 rounded-2xl shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="size-5 text-primary" />
            Model Evaluation Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border/50 bg-surface/50 p-6">
            <p className="text-sm text-muted-foreground mb-4">
              Model evaluation metrics (MAE, MSE, RMSE, R²) are not currently available in the database.
              These metrics should be calculated during model training and stored for monitoring.
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-sm font-medium text-muted-foreground">MAE</p>
                <p className="text-xl font-bold text-muted-foreground">N/A</p>
                <p className="text-xs text-muted-foreground">Mean Absolute Error</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-sm font-medium text-muted-foreground">MSE</p>
                <p className="text-xl font-bold text-muted-foreground">N/A</p>
                <p className="text-xs text-muted-foreground">Mean Squared Error</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-sm font-medium text-muted-foreground">RMSE</p>
                <p className="text-xl font-bold text-muted-foreground">N/A</p>
                <p className="text-xs text-muted-foreground">Root Mean Squared Error</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-sm font-medium text-muted-foreground">R²</p>
                <p className="text-xl font-bold text-muted-foreground">N/A</p>
                <p className="text-xs text-muted-foreground">Coefficient of Determination</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="size-5 text-primary" />
            Model Input Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {modelFeatures.map((feature) => (
              <div
                key={feature}
                className="rounded-lg border border-border bg-surface/50 px-4 py-3 transition-colors hover:bg-surface"
              >
                <code className="text-sm font-mono">{feature}</code>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
