import { useState, useEffect, useCallback } from "react";
import { Notification } from "@/types/notifications";
import { mockNotificationService } from "@/services/notifications/mockNotificationService";

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await mockNotificationService.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error("Failed to load notifications", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = async (id: string) => {
    // Optimistic update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    try {
      await mockNotificationService.markAsRead(id);
    } catch (error) {
      console.error("Failed to mark as read", error);
      loadNotifications(); // rollback on failure
    }
  };

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    try {
      await mockNotificationService.markAllAsRead();
    } catch (error) {
      console.error("Failed to mark all as read", error);
      loadNotifications();
    }
  };

  const deleteNotification = async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    try {
      await mockNotificationService.deleteNotification(id);
    } catch (error) {
      console.error("Failed to delete notification", error);
      loadNotifications();
    }
  };

  const clearAll = async () => {
    setNotifications([]);
    try {
      await mockNotificationService.clearAll();
    } catch (error) {
      console.error("Failed to clear notifications", error);
      loadNotifications();
    }
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    refresh: loadNotifications
  };
}
