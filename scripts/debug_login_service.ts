import { createClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Mimic lib/db.ts logic
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL is missing');
    process.exit(1);
}
if (!supabaseServiceKey) {
    console.error('Error: SUPABASE_SERVICE_ROLE_KEY is missing');
    process.exit(1);
}

// Create client exactly like lib/db.ts
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugLogin() {
    const email = 'admin@admin.com';
    const password = 'Pepito2020';

    console.log('--- Login Debug (Service Role) Start ---');
    console.log(`Connecting to: ${supabaseUrl}`);
    console.log(`Using Service Key (first 5 chars): ${supabaseServiceKey.substring(0, 5)}...`);

    // 1. Check User in DB
    const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

    if (error) {
        console.error('DB Error finding user:', error); // Print full error object
        return;
    }

    if (!user) {
        console.error('User not found in database.');
        return;
    }

    console.log('User found:', { id: user.id, email: user.email, role: user.role });

    // 2. Compare Password
    const match = await bcrypt.compare(password, user.password);

    if (match) {
        console.log('SUCCESS: Password matches! Credentials are correct via Service Role.');
    } else {
        console.error('FAILURE: Password mismatch.');
        console.log('Stored Hash:', user.password);
    }
}

debugLogin();
