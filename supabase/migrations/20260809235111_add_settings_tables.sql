CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    contact_number TEXT,
    email TEXT,
    business_hours TEXT,
    description TEXT,
    logo_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users" 
    ON public.system_settings FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Enable update access for authenticated users" 
    ON public.system_settings FOR UPDATE 
    TO authenticated 
    USING (true)
    WITH CHECK (true);

-- Insert default settings row if it doesn't exist
INSERT INTO public.system_settings (name, address, contact_number, email, business_hours, description)
SELECT 'Kape Uno Bistro', '123 Coffee Street, Metro Manila, Philippines', '(02) 8123 4567', 'hello@kapeuno.com', 'Mon - Sun: 7:00 AM - 10:00 PM', 'A cozy neighborhood bistro serving premium coffee and pastries.'
WHERE NOT EXISTS (SELECT 1 FROM public.system_settings);

-- Add preferences to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{"theme": "system", "tableDensity": "comfortable", "animations": true}'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notification_settings JSONB DEFAULT '{"lowStockAlerts": true, "systemAnnouncements": true, "inventoryNotifications": false, "purchaseNotifications": true, "salesNotifications": false, "expenseNotifications": true}'::jsonb;

-- Notify pgrst
NOTIFY pgrst, 'reload schema';
