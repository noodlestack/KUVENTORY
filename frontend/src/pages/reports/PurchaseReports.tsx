import { usePurchaseReport } from "@/hooks/reports/useReports";
import { KPICard } from "@/components/reports/KPICard";
import { ChartCard } from "@/components/reports/ChartCard";
import { ReportHeader } from "@/components/reports/ReportHeader";
import { BarChart, Bar, CartesianGrid, XAxis, Tooltip, YAxis, LineChart, Line } from "recharts";
import { ShoppingBag, Calculator } from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import { ChartTooltip } from "@/components/charts/ChartTooltip";
export function PurchaseReports() {
  const { data, isLoading } = usePurchaseReport();

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading purchase data...</div>;
  if (!data) return null;


  return (
    <div className="space-y-6">
      <ReportHeader title="Purchase Reports" reportName="Purchases Report" />
      
      <div className="grid gap-4 md:grid-cols-2">
        <KPICard title="Monthly Purchases" value={formatCurrency(data.monthlyPurchases)} icon={ShoppingBag} />
        <KPICard title="Average Purchase Value" value={formatCurrency(data.averagePurchase)} icon={Calculator} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <ChartCard title="Weekly Purchase Trend" className="col-span-1 lg:col-span-4">
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
