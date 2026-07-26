import { useState, useEffect, useCallback } from "react";
import { mockSettingsService } from "@/services/settings/mockSettingsService";
import { 
  UserProfile, 
  RestaurantSettings, 
  NotificationSettings, 
  UserAccount, 
  ActivityLog,
  UserPreferences
} from "@/types/settings";

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    const data = await mockSettingsService.getProfile();
    setProfile(data);
    setIsLoading(false);
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const updateProfile = async (data: Partial<UserProfile>) => {
    const updated = await mockSettingsService.updateProfile(data);
    setProfile(updated);
    return updated;
  };

  const updatePreferences = async (data: Partial<UserPreferences>) => {
    const updated = await mockSettingsService.updatePreferences(data);
    setProfile(prev => prev ? { ...prev, preferences: updated } : null);
    return updated;
  };

  return { profile, isLoading, refresh: fetchProfile, updateProfile, updatePreferences };
}

export function useRestaurantSettings() {
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    const data = await mockSettingsService.getRestaurantSettings();
    setSettings(data);
    setIsLoading(false);
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const updateSettings = async (data: Partial<RestaurantSettings>) => {
    const updated = await mockSettingsService.updateRestaurantSettings(data);
    setSettings(updated);
    return updated;
  };

  return { settings, isLoading, refresh: fetchSettings, updateSettings };
}

export function useNotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    const data = await mockSettingsService.getNotificationSettings();
    setSettings(data);
    setIsLoading(false);
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const updateSettings = async (data: Partial<NotificationSettings>) => {
    const updated = await mockSettingsService.updateNotificationSettings(data);
    setSettings(updated);
    return updated;
  };

  return { settings, isLoading, refresh: fetchSettings, updateSettings };
}

export function useUsers() {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    const data = await mockSettingsService.getUsers();
    setUsers(data);
    setIsLoading(false);
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const createUser = async (data: any) => {
    const newUser = await mockSettingsService.createUser(data);
    setUsers(prev => [...prev, newUser]);
    return newUser;
  };

  const updateUser = async (id: string, data: Partial<UserAccount>) => {
    const updated = await mockSettingsService.updateUser(id, data);
    setUsers(prev => prev.map(u => u.id === id ? updated : u));
    return updated;
  };

  return { users, isLoading, refresh: fetchUsers, createUser, updateUser };
}

export function useActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    const data = await mockSettingsService.getActivityLogs();
    setLogs(data);
    setIsLoading(false);
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  return { logs, isLoading, refresh: fetchLogs };
}
