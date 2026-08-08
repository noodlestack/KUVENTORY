import { supabase } from '@/integrations/supabase/client';
import { Notification, NotificationType, NotificationPriority } from "@/types/notifications";

export const notificationService = {
  getNotifications: async (): Promise<Notification[]> => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      return (data || []).map(n => ({
        id: n.id,
        title: n.title,
        message: n.message,
        type: (n.notification_type === 'SYSTEM' ? 'System' : 'General') as NotificationType,
        priority: 'medium' as NotificationPriority,
        timestamp: n.created_at,
        isRead: n.is_read,
        actionUrl: undefined
      }));
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      return [];
    }
  },

  markAsRead: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);
    if (error) console.error('Failed to mark read:', error);
  },

  markAllAsRead: async (): Promise<void> => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('is_read', false);
    if (error) console.error('Failed to mark all read:', error);
  },

  deleteNotification: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);
    if (error) console.error('Failed to delete:', error);
  },

  clearAll: async (): Promise<void> => {
    // In a real app we might not want to let users delete all, or we only delete theirs.
    // For now we'll delete all that are read
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('is_read', true);
    if (error) console.error('Failed to clear all:', error);
  }
};
