import { supabase } from '@/integrations/supabase/client';
import { 
  UserProfile, 
  UserAccount, 
  RestaurantSettings, 
  NotificationSettings, 
  ActivityLog, 
  UserPreferences 
} from "@/types/settings";


export const settingsService = {
  getProfile: async (): Promise<UserProfile> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*, user_roles(roles(name))')
      .eq('auth_user_id', user.id)
      .single();

    if (error) throw error;

    return {
      id: profile.id,
      fullName: profile.full_name,
      username: profile.username || '',
      email: user.email || '',
      phone: profile.phone_number || '',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      role: (profile.user_roles as any)?.[0]?.roles?.name || 'Unknown',
      status: profile.is_active ? 'Active' : 'Inactive',
      lastLogin: user.last_sign_in_at || new Date().toISOString(),
      createdAt: profile.created_at,
      preferences: (profile.preferences as UserPreferences) || {
        theme: "system",
        tableDensity: "comfortable",
        animations: true
      }
    };
  },
  
  updateProfile: async (data: Partial<UserProfile>): Promise<UserProfile> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: data.fullName,
        username: data.username,
        phone_number: data.phone
      })
      .eq('auth_user_id', user.id);

    if (error) throw error;

    return settingsService.getProfile();
  },

  updatePreferences: async (data: Partial<UserPreferences>): Promise<UserPreferences> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const profile = await settingsService.getProfile();
    const updated = { ...profile.preferences, ...data };

    const { error } = await supabase
      .from('profiles')
      .update({ preferences: updated })
      .eq('auth_user_id', user.id);

    if (error) throw error;
    return updated;
  },

  getRestaurantSettings: async (): Promise<RestaurantSettings> => {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    if (data) {
      return {
        name: data.name,
        address: data.address || '',
        contactNumber: data.contact_number || '',
        email: data.email || '',
        businessHours: data.business_hours || '',
        description: data.description || '',
        logoUrl: data.logo_url || ''
      };
    }
    
    return {
      name: "Kape Uno Bistro",
      address: "123 Coffee Street, Metro Manila, Philippines",
      contactNumber: "(02) 8123 4567",
      email: "hello@kapeuno.com",
      businessHours: "Mon - Sun: 7:00 AM - 10:00 PM",
      description: "A cozy neighborhood bistro serving premium coffee and pastries.",
    };
  },

  updateRestaurantSettings: async (data: Partial<RestaurantSettings>): Promise<RestaurantSettings> => {
    const { data: existing, error: checkError } = await supabase
      .from('system_settings')
      .select('id')
      .limit(1)
      .maybeSingle();

    if (checkError) throw checkError;

    const payload = {
      name: data.name,
      address: data.address,
      contact_number: data.contactNumber,
      email: data.email,
      business_hours: data.businessHours,
      description: data.description,
      logo_url: data.logoUrl,
    };

    if (existing?.id) {
      const { error } = await supabase
        .from('system_settings')
        .update(payload)
        .eq('id', existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('system_settings')
        .insert(payload);
      if (error) throw error;
    }

    return await settingsService.getRestaurantSettings();
  },

  getNotificationSettings: async (): Promise<NotificationSettings> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('notification_settings')
      .eq('auth_user_id', user.id)
      .single();

    if (error) throw error;

    if (profile?.notification_settings) {
      return profile.notification_settings as unknown as NotificationSettings;
    }
    
    return {
      lowStockAlerts: true,
      systemAnnouncements: true,
      inventoryNotifications: false,
      purchaseNotifications: true,
      salesNotifications: false,
      expenseNotifications: true,
    };
  },

  updateNotificationSettings: async (data: Partial<NotificationSettings>): Promise<NotificationSettings> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const current = await settingsService.getNotificationSettings();
    const updated = { ...current, ...data };

    const { error } = await supabase
      .from('profiles')
      .update({ notification_settings: updated })
      .eq('auth_user_id', user.id);

    if (error) throw error;
    return updated;
  },

  getUsers: async (): Promise<UserAccount[]> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, user_roles(roles(name))');

    if (error) throw error;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.map((profile: any) => ({
      id: profile.id,
      fullName: profile.full_name,
      username: profile.username || '',
      email: profile.email || '', // Email might not be available here unless stored
      role: profile.user_roles?.[0]?.roles?.name || 'Unknown',
      status: profile.is_active ? 'Active' : 'Inactive',
      lastLogin: new Date().toISOString(),
      createdAt: profile.created_at,
    }));
  },

  createUser: async (_data: Omit<UserAccount, "id" | "lastLogin" | "createdAt">): Promise<UserAccount> => {
    // In a real app, you would create the auth user first, typically via Edge Function or Supabase Admin API.
    // For now, this throws an error since we don't have Admin API access configured.
    throw new Error("Cannot create user directly from client without Admin API.");
  },

  updateUser: async (id: string, data: Partial<UserAccount>): Promise<UserAccount> => {
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: data.fullName,
        username: data.username,
        is_active: data.status === 'Active'
      })
      .eq('id', id);

    if (error) throw error;
    
    // We would need to update roles in user_roles table if data.role changed
    if (data.role) {
      const { data: roleData } = await supabase.from('roles').select('id').eq('name', data.role).single();
      if (roleData) {
        await supabase.from('user_roles').delete().eq('profile_id', id);
        await supabase.from('user_roles').insert({ profile_id: id, role_id: roleData.id });
      }
    }

    const { data: updatedProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*, user_roles(roles(name))')
      .eq('id', id)
      .single();
      
    if (fetchError) throw fetchError;
    
    return {
      id: updatedProfile.id,
      fullName: updatedProfile.full_name,
      username: updatedProfile.username || '',
      email: '',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      role: (updatedProfile.user_roles as any)?.[0]?.roles?.name || 'Unknown',
      status: updatedProfile.is_active ? 'Active' : 'Inactive',
      lastLogin: new Date().toISOString(),
      createdAt: updatedProfile.created_at,
    };
  },

  getActivityLogs: async (): Promise<ActivityLog[]> => {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*, profiles(full_name)')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.map((log: any) => ({
      id: log.id,
      date: log.created_at,
      user: log.profiles?.full_name || 'System',
      module: log.table_name,
      action: log.action,
      description: `${log.action} on ${log.table_name}`
    }));
  }
};
