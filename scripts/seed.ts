import { createClient } from '@supabase/supabase-js';
import { allAmenities as amenities } from '../lib/amenities-data';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Manually configure Supabase client for the script
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Supabase URL and service role key must be defined in environment variables.');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  console.log('Starting database seeding...');

  // 1. Insert Admin User
  console.log('Checking admin user...');
  const { data: existingUser, error: userError } = await supabase.from('users').select('id').eq('email', 'admin@vagar.com').single();

  if (userError && userError.code !== 'PGRST116') { // PGRST116 is "The result contains 0 rows"
    console.error('Error checking admin user:', userError);
  }

  if (!existingUser) {
    console.log('Inserting admin user...');
    const adminPasswordHash = '$2b$10$7fxnolE0gTw88FmTUpXHNO30nINqKOvdmsF21MHcOvwIse6XFrt46'; // Same as before
    const { error: insertUserError } = await supabase.from('users').insert({
      id: 1, // Asignar ID manualmente para evitar problemas de secuencia
      name: 'Admin',
      email: 'admin@vagar.com',
      password: adminPasswordHash,
      role: 'admin'
    });
    if (insertUserError) {
      console.error('Error inserting admin user:', insertUserError);
      return;
    }
    console.log('Admin user inserted.');
  } else {
    console.log('Admin user already exists.');
  }

  // 2. Insert/Update Amenities
  console.log('Upserting amenities...');
  const amenitiesToInsert = amenities.map(a => ({ slug: a.id, name: a.name, category: a.category, icon: a.icon }));

  // Use upsert to avoid errors if they already exist, and update them if they changed
  const { data: insertedAmenities, error: amenitiesError } = await supabase
    .from('amenities')
    .upsert(amenitiesToInsert, { onConflict: 'slug' })
    .select();

  if (amenitiesError) {
    console.error('Error upserting amenities:', amenitiesError);
    return;
  }
  console.log('Amenities upserted.');

  console.log('Database seeding completed successfully. No demo data was inserted.');
}

main().catch((err) => {
  console.error('An error occurred during the database seeding process:', err);
  process.exit(1);
});
