import { useAuth } from "@/contexts/AuthContext";
import { useDashboard } from "@/hooks/dashboard/useDashboard";
import { DollarSign, ShoppingCart, Package, AlertCircle, TrendingDown, Users } from "lucide-react";

import { StatCard } from "@/components/dashboard/StatCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { ActivityTimeline } from "@/components/dashboard/ActivityTimeline";
import { NotificationPanel } from "@/components/dashboard/NotificationPanel";
import { StatCardSkeleton, QuickActionsSkeleton, ChartSkeleton, ListSkeleton } from "@/components/dashboard/DashboardSkeletons";

export function Dashboard() {
  const { user } = useAuth();
  const { metrics, activities, notifications, salesData, categoryData, isLoading } = useDashboard();

  const currentDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date());

  const formatCurrency = (val: number) => `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6">
      
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Good Morning, {user?.username || "User"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {user?.role || "Staff"} &bull; {currentDate}
        </p>
      </div>

      {/* Quick Actions */}
      {isLoading ? <QuickActionsSkeleton /> : <QuickActions />}

      {/* Stat Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading || !metrics ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard 
              title="Today's Sales" 
              value={formatCurrency(metrics.todaySales)} 
              icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
              trend={metrics.salesTrend}
              trendLabel="from yesterday"
              href="/sales"
            />
            <StatCard 
              title="Today's Transactions" 
              value={metrics.todayTransactions} 
              icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />}
              trend={metrics.transactionsTrend}
              trendLabel="from yesterday"
              href="/sales"
            />
            <StatCard 
              title="Total Inventory Items" 
              value={metrics.currentInventoryItems.toLocaleString()} 
              icon={<Package className="h-4 w-4 text-muted-foreground" />}
              href="/inventory"
            />
            <StatCard 
              title="Low Stock Products" 
              value={metrics.lowStockProducts} 
              icon={<AlertCircle className="h-4 w-4 text-warning" />}
              className={metrics.lowStockProducts > 10 ? "border-warning/50 bg-warning/5" : ""}
              href="/inventory"
            />
          </>
        )}
      </div>

      {/* Charts */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2"><ChartSkeleton /></div>
          <div><ChartSkeleton /></div>
        </div>
      ) : (
        <DashboardCharts salesData={salesData} categoryData={categoryData} />
      )}

      {/* Second Row Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading || !metrics ? (
           Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={`row2-${i}`} />)
        ) : (
          <>
            <StatCard 
              title="Current Products" 
              value={metrics.currentProducts} 
              icon={<Package className="h-4 w-4 text-muted-foreground" />}
              href="/products"
            />
            <StatCard 
              title="Out of Stock" 
              value={metrics.outOfStockProducts} 
              icon={<TrendingDown className="h-4 w-4 text-destructive" />}
              className={metrics.outOfStockProducts > 0 ? "border-destructive/50 bg-destructive/5" : ""}
              href="/inventory"
            />
            <StatCard 
              title="Monthly Expenses" 
              value={formatCurrency(metrics.monthlyExpenses)} 
              icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
              trend={metrics.expensesTrend}
              trendLabel="from last month"
              href="/expenses"
            />
            <StatCard 
              title="Active Suppliers" 
              value={metrics.activeSuppliers} 
              icon={<Users className="h-4 w-4 text-muted-foreground" />}
              href="/suppliers"
            />
          </>
        )}
      </div>

      {/* Lists Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          <>
            <ListSkeleton />
            <ListSkeleton />
          </>
        ) : (
          <>
            <ActivityTimeline activities={activities} />
            <NotificationPanel notifications={notifications} />
          </>
        )}
      </div>

    </div>
  );
}
