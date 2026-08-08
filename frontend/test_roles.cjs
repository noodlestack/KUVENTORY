const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const supabaseUrl = env.match(/SUPABASE_URL="(.*)"/)[1];
const supabaseKey = env.match(/SUPABASE_SERVICE_ROLE_KEY="(.*)"/)[1];
const supabase = createClient(supabaseUrl, supabaseKey);
supabase.from('user_roles').select('profile_id, roles(name)').then(x => console.log(JSON.stringify(x))).catch(console.error);
