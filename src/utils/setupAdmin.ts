import { supabase } from '../lib/supabase';

/**
 * One-time setup script to create admin account
 * Run this once to create the admin user with specified credentials
 * 
 * Email: maheshch1094@gmail.com
 * Password: Mahesh06
 */
export async function setupAdminAccount() {
  const adminEmail = 'maheshch1094@gmail.com';
  const adminPassword = 'Mahesh06';

  try {
    // Sign up the admin user
    const { data, error } = await supabase.auth.signUp({
      email: adminEmail,
      password: adminPassword,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      // If user already exists, try to sign in to verify credentials
      if (error.message.includes('already registered')) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: adminEmail,
          password: adminPassword,
        });

        if (signInError) {
          return { 
            success: false, 
            message: 'Account exists but password is different. Please use Supabase dashboard to update password or use forgot password feature.',
          };
        }

        return { 
          success: true, 
          message: 'Admin account already configured with correct credentials.',
        };
      }

      throw error;
    }

    return { 
      success: true, 
      message: 'Admin account created. Check email for verification if required.',
      data,
    };

  } catch (error: any) {
    return { 
      success: false, 
      error: error.message,
    };
  }
}

// Uncomment below to run automatically when this file is imported
// setupAdminAccount();
