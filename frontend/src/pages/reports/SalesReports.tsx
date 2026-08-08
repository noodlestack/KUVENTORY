import { useState } from "react";
import { useSalesReport } from "@/hooks/reports/useReports";
import { KPICard } from "@/components/reports/KPICard";
import { ChartCard } from "@/components/reports/ChartCard";
import { ReportHeader } from "@/components/reports/ReportHeader";
import { ReportFilterBar, ReportFilterState } from "@/components/reports/ReportFilterBar";
import { BarChart, Bar, CartesianGrid, XAxis, Tooltip, YAxis } from "recharts";
import { Banknote, Calendar, BarChart3, ShoppingCart } from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import { ChartTooltip } from "@/components/charts/ChartTooltip";

export function SalesReports() {
  const [filters, setFilters] = useState<ReportFilterState>({ dateRangePreset: "this_month" });
  const { data, isLoading } = useSalesReport(filters);

  if (isLoading && !data) return <div className="p-8 text-center text-muted-foreground">Loading sales data...</div>;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <ReportHeader 
        title="Sales Reports" 
        reportName="Sales Report" 
        exportData={data.salesTrend}
        exportColumns={[
          { header: "Period", dataKey: "name" },
          { header: "Revenue (PHP)", dataKey: "value" }
        ]}
      />
      
      <ReportFilterBar onFilterChange={setFilters} isLoading={isLoading} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Today's Sales" value={formatCurrency(data.dailySales)} icon={Banknote} />
        <KPICard title="This Week" value={formatCurrency(data.weeklySales)} icon={Calendar} />
        <KPICard title="This Month" value={formatCurrency(data.monthlySales)} icon={BarChart3} />
        <KPICard title="Avg. Sale Value" value={formatCurrency(data.averageSale)} icon={ShoppingCart} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <ChartCard title="Sales Trend" className="col-span-1 lg:col-span-4">
          <BarChart data={data.salesTrend}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value: number) => formatCurrency(value)} width={90} />
            <Tooltip 
              content={<ChartTooltip formatter={(value) => [formatCurrency(value as number), 'Revenue']} />}
              cursor={{fill: 'var(--muted)'}} 
            />
            <Bar dataKey="value" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
          </BarChart>
        </ChartCard>

        <ChartCard title="Top Selling Items" className="col-span-1 lg:col-span-3">
          <BarChart data={data.topSellingItems} layout="vertical" margin={{ left: 40 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" hide />
            <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip 
              content={<ChartTooltip formatter={(value) => [formatCurrency(value as number), 'Revenue']} />}
              cursor={{fill: 'var(--muted)'}} 
            />
            <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
          </BarChart>
        </ChartCard>
      </div>
    </div>
  );
}
