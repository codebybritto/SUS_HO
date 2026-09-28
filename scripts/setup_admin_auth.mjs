import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminClient = createClient(url, serviceKey);

async function setupAdminAuth() {
  const email = 'igor.britto@gestao.saude.rj.gov.br';
  const password = process.env.ADMIN_INITIAL_PASSWORD || 'ho2026@';

  console.log(`Checking if ${email} already exists in auth.users...`);
  const { data: list, error: listErr } = await adminClient.auth.admin.listUsers();
  if (listErr) {
    console.error('Error listing auth users:', listErr);
    return;
  }

  const existing = list.users.find(u => u.email === email);
  if (existing) {
    console.log('User already exists with ID:', existing.id);
    // Update password to ensure it matches
    const { data: upd, error: updErr } = await adminClient.auth.admin.updateUserById(existing.id, {
      password: password,
      email_confirm: true,
      user_metadata: {
        name: 'Igor Britto',
        login: 'igor.britto',
        role: 'admin',
        unit_ids: ['unit-1', 'unit-2', 'unit-3', 'unit-4'],
      }
    });
    if (updErr) console.error('Error updating user:', updErr);
    else console.log('Updated user successfully:', upd.user.id);
  } else {
    console.log('Creating user in auth.users...');
    const { data: created, error: createErr } = await adminClient.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        name: 'Igor Britto',
        login: 'igor.britto',
        role: 'admin',
        unit_ids: ['unit-1', 'unit-2', 'unit-3', 'unit-4'],
      }
    });
    if (createErr) console.error('Error creating user:', createErr);
    else console.log('Created user in auth.users successfully:', created.user.id);
  }
}

setupAdminAuth();
