import { useState, useEffect } from "react";
import { dashboardService } from "@/services/dashboard/dashboardService";
import { DashboardMetrics, Activity, Notification, ChartDataPoint } from "@/types/dashboard";

export function useDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [salesData, setSalesData] = useState<ChartDataPoint[]>([]);
  const [categoryData, setCategoryData] = useState<ChartDataPoint[]>([]);

  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);
  const [isLoadingCharts, setIsLoadingCharts] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      // Fetch in parallel for realism, but set states independently
      dashboardService.getMetrics().then(data => {
        setMetrics(data);
        setIsLoadingMetrics(false);
      });

      dashboardService.getRecentActivities().then(data => {
        setActivities(data);
        setIsLoadingActivities(false);
      });

      dashboardService.getNotifications().then(data => {
        setNotifications(data);
        setIsLoadingNotifications(false);
      });

      Promise.all([
        dashboardService.getSalesChartData(),
        dashboardService.getCategoryChartData()
      ]).then(([sales, categories]) => {
        setSalesData(sales);
        setCategoryData(categories);
        setIsLoadingCharts(false);
      });
    };

    fetchAll();
  }, []);

  return {
    metrics,
    activities,
    notifications,
    salesData,
    categoryData,
    isLoading: isLoadingMetrics || isLoadingActivities || isLoadingNotifications || isLoadingCharts,
    isLoadingMetrics,
    isLoadingActivities,
    isLoadingNotifications,
    isLoadingCharts
  };
}
