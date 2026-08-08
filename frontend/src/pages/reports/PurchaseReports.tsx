import { useState } from "react";
import { usePurchaseReport } from "@/hooks/reports/useReports";
import { KPICard } from "@/components/reports/KPICard";
import { ChartCard } from "@/components/reports/ChartCard";
import { ReportHeader } from "@/components/reports/ReportHeader";
import { ReportFilterBar, ReportFilterState } from "@/components/reports/ReportFilterBar";
import { BarChart, Bar, CartesianGrid, XAxis, Tooltip, YAxis, LineChart, Line } from "recharts";
import { ShoppingBag, Calculator } from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import { ChartTooltip } from "@/components/charts/ChartTooltip";

export function PurchaseReports() {
  const [filters, setFilters] = useState<ReportFilterState>({ dateRangePreset: "this_month" });
  const { data, isLoading } = usePurchaseReport(filters);

  if (isLoading && !data) return <div className="p-8 text-center text-muted-foreground">Loading purchase data...</div>;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <ReportHeader 
        title="Purchase Reports" 
        reportName="Purchases Report" 
        exportData={data.purchaseTrend}
        exportColumns={[
          { header: "Period", dataKey: "name" },
          { header: "Purchases (PHP)", dataKey: "value" }
        ]}
      />
      
      <ReportFilterBar onFilterChange={setFilters} isLoading={isLoading} />

      <div className="grid gap-4 md:grid-cols-2">
        <KPICard title="Total Purchases" value={formatCurrency(data.monthlyPurchases)} icon={ShoppingBag} />
        <KPICard title="Average Purchase Value" value={formatCurrency(data.averagePurchase)} icon={Calculator} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <ChartCard title="Purchase Trend" className="col-span-1 lg:col-span-4">
          <LineChart data={data.purchaseTrend}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value: number) => formatCurrency(value)} width={90} />
            <Tooltip 
              content={<ChartTooltip formatter={(value) => [formatCurrency(value as number), 'Purchases']} />}
            />
            <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 8 }} />
          </LineChart>
        </ChartCard>

        <ChartCard title="Spending by Top Suppliers" className="col-span-1 lg:col-span-3">
          <BarChart data={data.topSuppliers} layout="vertical" margin={{ left: 60 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" hide />
            <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip 
              content={<ChartTooltip formatter={(value) => [formatCurrency(value as number), 'Spent']} />}
              cursor={{fill: 'var(--muted)'}} 
            />
            <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
          </BarChart>
        </ChartCard>
      </div>
    </div>
  );
}
