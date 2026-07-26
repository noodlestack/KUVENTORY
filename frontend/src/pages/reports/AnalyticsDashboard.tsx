import { useAnalyticsSummary } from "@/hooks/reports/useReports";
import { KPICard } from "@/components/reports/KPICard";
import { ChartCard } from "@/components/reports/ChartCard";
import { ReportHeader } from "@/components/reports/ReportHeader";
import { LineChart, Line, CartesianGrid, XAxis, Tooltip, YAxis, PieChart, Pie, Cell } from "recharts";
import { Banknote, ShoppingCart, Package, TrendingUp, TrendingDown, Users, AlertCircle, ShoppingBag } from "lucide-react";
import { formatCurrency } from "@/utils/currency";

const COLORS = ['#10b981', '#f43f5e', '#f59e0b', '#3b82f6'];

export function AnalyticsDashboard() {
  const { data, isLoading } = useAnalyticsSummary();

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading analytics...</div>;
  if (!data) return null;


  return (
    <div className="space-y-6">
      <ReportHeader title="Analytics Overview" reportName="Analytics Summary" />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Total Sales" value={formatCurrency(data.kpis.totalSales)} icon={Banknote} trend="up" subtitle="+12% from last month" />
        <KPICard title="Total Expenses" value={formatCurrency(data.kpis.totalExpenses)} icon={TrendingDown} trend="down" subtitle="-5% from last month" />
        <KPICard title="Net Income" value={formatCurrency(data.kpis.netIncome)} icon={TrendingUp} trend="up" subtitle="Highly profitable" />
        <KPICard title="Transactions" value={data.kpis.transactionCount} icon={ShoppingCart} />
        
        <KPICard title="Active Inventory" value={data.kpis.activeInventoryItems} icon={Package} />
        <KPICard title="Low Stock Alerts" value={data.kpis.lowStockItems} icon={AlertCircle} trend="down" />
        <KPICard title="Total Suppliers" value={data.kpis.totalSuppliers} icon={Users} />
        <KPICard title="Total Purchases" value={formatCurrency(data.kpis.totalPurchases)} icon={ShoppingBag} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <ChartCard title="Sales vs Expenses (6 Months)">
          <LineChart data={data.salesTrend.map((s, i) => ({ name: s.name, Sales: s.value, Expenses: data.expenseTrend[i]?.value || 0 }))}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value: number) => `₱${value/1000}k`} />
            <Tooltip formatter={(value: number) => [formatCurrency(value)]} labelStyle={{ color: 'black' }} />
            <Line type="monotone" dataKey="Sales" stroke="#10b981" strokeWidth={2} activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="Expenses" stroke="#f43f5e" strokeWidth={2} />
          </LineChart>
        </ChartCard>

        <ChartCard title="Inventory Health Status">
          <PieChart>
            <Pie
              data={data.inventoryHealth}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {data.inventoryHealth.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => [`${value} Items`]} />
          </PieChart>
        </ChartCard>
      </div>
    </div>
  );
}
