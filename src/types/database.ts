
export type Profile = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'employee' | 'team_lead' | 'manager';
  avatar?: string;
  monthly_points: number;
  title?: string;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
};

export type UserPermission = {
  id: string;
  user_id: string;
  target_user_id: string;
  can_view: boolean;
  can_edit: boolean;
};
