import { useState, useEffect } from "react";
import { mockDashboardService } from "@/services/dashboard/mockService";
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
      mockDashboardService.getMetrics().then(data => {
        setMetrics(data);
        setIsLoadingMetrics(false);
      });

      mockDashboardService.getRecentActivities().then(data => {
        setActivities(data);
        setIsLoadingActivities(false);
      });

      mockDashboardService.getNotifications().then(data => {
        setNotifications(data);
        setIsLoadingNotifications(false);
      });

      Promise.all([
        mockDashboardService.getSalesChartData(),
        mockDashboardService.getCategoryChartData()
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
