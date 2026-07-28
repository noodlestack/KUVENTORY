import { useSupplierReport } from "@/hooks/reports/useReports";
import { KPICard } from "@/components/reports/KPICard";
import { ChartCard } from "@/components/reports/ChartCard";
import { ReportHeader } from "@/components/reports/ReportHeader";
import { BarChart, Bar, CartesianGrid, XAxis, Tooltip, YAxis, PieChart, Pie, Cell } from "recharts";
import { Users, Truck } from "lucide-react";
import { formatCurrency } from "@/utils/currency";

const COLORS = ['#10b981', '#9ca3af'];

export function SupplierReports() {
  const { data, isLoading } = useSupplierReport();

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading supplier data...</div>;
  if (!data) return null;


  return (
    <div className="space-y-6">
      <ReportHeader title="Supplier Reports" reportName="Supplier Report" />
      
      <div className="grid gap-4 md:grid-cols-2">
        <KPICard title="Total Suppliers" value={data.totalSuppliers} icon={Users} />
        <KPICard title="Active Suppliers" value={data.activeSuppliers} icon={Truck} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <ChartCard title="Supplier Activity Status">
          <PieChart>
            <Pie
              data={data.supplierActivity}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {data.supplierActivity.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [`${value} Suppliers`]}
              contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
              itemStyle={{ color: 'hsl(var(--foreground))' }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
          </PieChart>
        </ChartCard>

        <ChartCard title="Spending by Supplier">
          <BarChart data={data.spendingBySupplier}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value: number) => formatCurrency(value)} />
            <Tooltip 
              formatter={(value: number) => [formatCurrency(value), 'Spent']} 
              contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
              itemStyle={{ color: 'hsl(var(--foreground))' }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              cursor={{fill: 'var(--muted)'}} 
            />
            <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartCard>
      </div>
    </div>
  );
}
