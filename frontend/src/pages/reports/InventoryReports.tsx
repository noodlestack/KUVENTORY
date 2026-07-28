import { useInventoryReport } from "@/hooks/reports/useReports";
import { KPICard } from "@/components/reports/KPICard";
import { ChartCard } from "@/components/reports/ChartCard";
import { ReportHeader } from "@/components/reports/ReportHeader";
import { BarChart, Bar, CartesianGrid, XAxis, Tooltip, YAxis, PieChart, Pie, Cell } from "recharts";
import { Package, AlertCircle, AlertTriangle, Calculator } from "lucide-react";
import { formatCurrency } from "@/utils/currency";

const COLORS = ['#10b981', '#f59e0b', '#f43f5e'];

export function InventoryReports() {
  const { data, isLoading } = useInventoryReport();

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading inventory data...</div>;
  if (!data) return null;


  return (
    <div className="space-y-6">
      <ReportHeader title="Inventory Reports" reportName="Inventory Report" />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Total Valuation" value={formatCurrency(data.totalValue)} icon={Calculator} />
        <KPICard title="Total Items" value={data.itemCount} icon={Package} />
        <KPICard title="Low Stock" value={data.lowStockCount} icon={AlertTriangle} trend="down" />
        <KPICard title="Out of Stock" value={data.outOfStockCount} icon={AlertCircle} trend="down" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <ChartCard title="Inventory Movement (4 Weeks)">
          <BarChart data={data.inventoryMovement}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }} itemStyle={{ color: 'hsl(var(--foreground))' }} labelStyle={{ color: 'hsl(var(--foreground))' }} formatter={(value: number) => [value, 'Items Moved']} cursor={{fill: 'transparent'}} />
            <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartCard>

        <ChartCard title="Stock Status Distribution">
          <PieChart>
            <Pie
              data={data.inventoryByStatus}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {data.inventoryByStatus.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }} itemStyle={{ color: 'hsl(var(--foreground))' }} labelStyle={{ color: 'hsl(var(--foreground))' }} formatter={(value: number) => [`${value} Items`]} />
          </PieChart>
        </ChartCard>
      </div>
    </div>
  );
}
