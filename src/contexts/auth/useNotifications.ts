
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Notification } from "@/types";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Fetch notifications for a user
  const fetchNotifications = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (data) {
        setNotifications(data);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };
  
  // Mark a notification as read
  const markNotificationAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);
      
      if (!error) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === id 
              ? { ...notification, read: true } 
              : notification
          )
        );
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    fetchNotifications,
    markNotificationAsRead,
    unreadNotificationsCount
  };
};
