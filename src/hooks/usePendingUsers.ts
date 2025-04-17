
import { useState, useCallback } from 'react';
import { User } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const usePendingUsers = () => {
  const [isProcessing, setIsProcessing] = useState<Record<string, boolean>>({});

  const handleApprove = async (user: User, role: string, title?: string) => {
    try {
      setIsProcessing(prev => ({ ...prev, [user.id]: true }));
      console.log("Approving user:", user.id, "with role:", role, "and title:", title);

      // Update the user's profile in the profiles table
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_approved: true, 
          role: role, 
          title: title || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      // Send approval email via edge function
      const { error: emailError } = await supabase.functions.invoke('send-approval-email', {
        body: {
          name: user.name,
          email: user.email,
          role: role
        }
      });

      if (emailError) {
        console.error("Error sending approval email:", emailError);
        toast.error("Approved user but failed to send notification email");
      }

      toast.success(`User ${user.name} has been approved as ${role}`);
      return true;
    } catch (error) {
      console.error("Error in handleApprove:", error);
      toast.error("Failed to approve user");
      return false;
    } finally {
      setIsProcessing(prev => ({ ...prev, [user.id]: false }));
    }
  };

  const handleReject = async (userId: string) => {
    try {
      setIsProcessing(prev => ({ ...prev, [userId]: true }));

      // Delete the user from auth.users (this will cascade to profiles due to FK)
      const { error } = await supabase.auth.admin.deleteUser(userId);

      if (error) {
        throw error;
      }

      toast.success("User has been rejected");
      return true;
    } catch (error) {
      console.error("Error in handleReject:", error);
      toast.error("Failed to reject user");
      return false;
    } finally {
      setIsProcessing(prev => ({ ...prev, [userId]: false }));
    }
  };

  return {
    isProcessing,
    handleApprove,
    handleReject
  };
};
