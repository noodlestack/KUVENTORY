import { useExpenseReport } from "@/hooks/reports/useReports";
import { KPICard } from "@/components/reports/KPICard";
import { ChartCard } from "@/components/reports/ChartCard";
import { ReportHeader } from "@/components/reports/ReportHeader";
import { BarChart, Bar, CartesianGrid, XAxis, Tooltip, YAxis, LineChart, Line } from "recharts";
import { Receipt, Calendar, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import { ChartTooltip } from "@/components/charts/ChartTooltip";
export function ExpenseReports() {
  const { data, isLoading } = useExpenseReport();

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading expense data...</div>;
  if (!data) return null;


  return (
    <div className="space-y-6">
      <ReportHeader 
        title="Expense Reports" 
        reportName="Expenses Report" 
        exportData={data.expenseCategories}
        exportColumns={[
          { header: "Category", dataKey: "name" },
          { header: "Amount (PHP)", dataKey: "value" }
        ]}
      />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Today's Expenses" value={formatCurrency(data.dailyExpenses)} icon={Receipt} />
        <KPICard title="This Month" value={formatCurrency(data.monthlyExpenses)} icon={Calendar} />
        <KPICard title="Highest Expense" value={formatCurrency(data.highestExpense)} icon={ArrowUpCircle} />
        <KPICard title="Lowest Expense" value={formatCurrency(data.lowestExpense)} icon={ArrowDownCircle} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <ChartCard title="Expense Trend (4 Weeks)" className="col-span-1 lg:col-span-4">
          <LineChart data={data.expenseTrend}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value: number) => formatCurrency(value)} width={90} />
            <Tooltip 
              content={<ChartTooltip formatter={(value) => [formatCurrency(value as number), 'Expenses']} />}
            />
            <Line type="monotone" dataKey="value" stroke="#f43f5e" strokeWidth={2} activeDot={{ r: 8 }} />
          </LineChart>
        </ChartCard>

        <ChartCard title="Expenses by Category" className="col-span-1 lg:col-span-3">
          <BarChart data={data.expenseCategories} layout="vertical" margin={{ left: 50 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" hide />
            <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip 
              content={<ChartTooltip formatter={(value) => [formatCurrency(value as number), 'Expenses']} />}
              cursor={{fill: 'var(--muted)'}} 
            />
            <Bar dataKey="value" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={20} />
          </BarChart>
        </ChartCard>
      </div>
    </div>
  );
}
