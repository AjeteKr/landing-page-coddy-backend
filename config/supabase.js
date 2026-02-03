import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

let supabase = null;
let supabaseService = null;

if (!supabaseUrl || !supabaseAnonKey) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Missing Supabase configuration in environment variables');
  }
  console.warn('⚠️  Supabase not configured. Database features disabled.');
} else {
  // Client for public operations (uses anon key)
  supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Service client for server operations (uses service key)
  supabaseService = createClient(supabaseUrl, supabaseServiceKey);
}

export { supabase, supabaseService };
export default supabase;
