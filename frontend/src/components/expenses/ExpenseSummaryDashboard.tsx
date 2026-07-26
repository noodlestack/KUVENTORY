import { ExpenseSummaryData } from "@/types/expenses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt, Banknote, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/utils/currency";

interface ExpenseSummaryDashboardProps {
  summary: ExpenseSummaryData | null;
}

export function ExpenseSummaryDashboard({ summary }: ExpenseSummaryDashboardProps) {
  if (!summary) return null;


  return (
    <div className="space-y-6 mt-4">
      {/* KPI Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalExpenses)}</div>
            <p className="text-xs text-muted-foreground mt-1">For the current month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Expense</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.averageExpense)}</div>
            <p className="text-xs text-muted-foreground mt-1">Per transaction</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Highest Single Expense</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.highestExpense)}</div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lowest Single Expense</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.lowestExpense)}</div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-4">
          <CardHeader>
            <CardTitle>Expense Trend (6 Months)</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Expenses']}
                    labelStyle={{ color: 'black' }}
                  />
                  <Bar dataKey="value" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>Category Breakdown (This Month)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {summary.categoryBreakdown.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">No data available.</div>
              ) : (
                summary.categoryBreakdown.sort((a,b) => b.value - a.value).map((cat, idx) => (
                  <div key={idx} className="flex items-center">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{cat.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {((cat.value / summary.totalExpenses) * 100).toFixed(1)}% of total
                      </p>
                    </div>
                    <div className="ml-auto font-medium text-destructive">
                      {formatCurrency(cat.value)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
