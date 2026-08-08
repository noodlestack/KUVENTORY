import { useState } from "react";
import { useDiscountReport } from "@/hooks/reports/useReports";
import { KPICard } from "@/components/reports/KPICard";
import { ChartCard } from "@/components/reports/ChartCard";
import { ReportHeader } from "@/components/reports/ReportHeader";
import { ReportFilterBar, ReportFilterState } from "@/components/reports/ReportFilterBar";
import { BarChart, Bar, CartesianGrid, XAxis, Tooltip, YAxis, LineChart, Line } from "recharts";
import { Tags, TrendingDown, Percent, FileText } from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import { ChartTooltip } from "@/components/charts/ChartTooltip";

export function DiscountReports() {
  const [filters, setFilters] = useState<ReportFilterState>({ dateRangePreset: "this_month" });
  const { data, isLoading } = useDiscountReport(filters);

  if (isLoading && !data) return <div className="p-8 text-center text-muted-foreground">Loading discount data...</div>;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <ReportHeader 
        title="Discount & Promo Reports" 
        reportName="Discounts Report"
        exportData={data.discountTrend}
        exportColumns={[
          { header: "Period", dataKey: "name" },
          { header: "Discounts (PHP)", dataKey: "value" }
        ]} 
      />
      
      <ReportFilterBar onFilterChange={setFilters} isLoading={isLoading} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Total Transactions" value={data.totalTransactions} icon={FileText} />
        <KPICard title="Original Amount" value={formatCurrency(data.originalAmount)} icon={TrendingDown} />
        <KPICard title="Total Discount" value={formatCurrency(data.totalDiscount)} icon={Tags} />
        <KPICard title="Net Amount" value={formatCurrency(data.netAmount)} icon={Percent} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <ChartCard title="Discount Trend" className="col-span-1 lg:col-span-4">
          <LineChart data={data.discountTrend}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value: number) => formatCurrency(value)} width={90} />
            <Tooltip 
              content={<ChartTooltip formatter={(value) => [formatCurrency(value as number), 'Discounts Given']} />}
            />
            <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} activeDot={{ r: 8 }} />
          </LineChart>
        </ChartCard>

        <ChartCard title="Discounts by Type" className="col-span-1 lg:col-span-3">
          <BarChart data={data.discountByType} layout="vertical" margin={{ left: 50 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" hide />
            <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip 
              content={<ChartTooltip formatter={(value) => [formatCurrency(value as number), 'Total Discount']} />}
              cursor={{fill: 'var(--muted)'}} 
            />
            <Bar dataKey="value" fill="#ec4899" radius={[0, 4, 4, 0]} barSize={20} />
          </BarChart>
        </ChartCard>
      </div>
    </div>
  );
}
