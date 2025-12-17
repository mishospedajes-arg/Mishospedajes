import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

console.log('Checking environment variables for seeding script...');
console.log('--------------------------------------------------');
console.log(`SUPABASE_URL: ${process.env.SUPABASE_URL ? 'Loaded' : 'MISSING'}`);
console.log(`SUPABASE_ANON_KEY: ${process.env.SUPABASE_ANON_KEY ? 'Loaded' : 'MISSING'}`);
console.log(`SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Loaded' : 'MISSING'}`);
console.log('--------------------------------------------------');

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY is not loaded. Please check your .env.local file.');
    console.error('It should look like: SUPABASE_SERVICE_ROLE_KEY=your_actual_key');
} else {
    console.log('SUCCESS: SUPABASE_SERVICE_ROLE_KEY is loaded.');
}
