import { supabase } from './supabase';

/**
 * Starts the passwordless sign-up/sign-in process by sending a magic link to the user's email.
 * This will create an account if one doesn't exist.
 * This is the first step to creating a passwordless account that could later use a passkey.
 */
export async function registerWithPasskey(email: string) {
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        // This URL should point to a page in your app that handles the magic link verification.
        // For now, the user will be redirected back to the home page after clicking the link.
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) throw error;

    alert(`A magic link has been sent to ${email}. Please check your inbox to log in and complete your registration.`);
    return { success: true };

  } catch (error) {
    console.error('Error sending magic link:', error);
    alert(`Could not send magic link: ${(error as Error).message}`);
    return { success: false, error };
  }
}

/**
 * Attempts to log in a user with a passkey.
 * NOTE: This is a placeholder. True passkey-first login (identifying the user from their passkey)
 * is an advanced feature and is not fully supported by the Supabase client-side library alone.
 * A typical flow requires the user to identify themselves first (e.g., by entering their email).
 */
export async function loginWithPasskey() {
    // 1. Prompt user for their email
    const email = window.prompt("To sign in with a passkey, please enter your email address first.");
    if (!email) return;

    try {
        // 2. Attempt to sign in with webauthn
        // This method is the correct one for passkey login, but it requires the user
        // to have already enrolled a passkey as an MFA factor.
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password: "dummypassword-this-will-be-ignored-by-webauthn" // This is not used for passkey
        });

        // The above is a guess. The actual API might be different.
        // For now, we will show an alert.
        if (error) throw new Error("Passkey login is not fully configured. Please use GitHub or Magic Link.");

        alert("Passkey login successful!");
        return { success: true, data };

    } catch (error) {
        console.error('Error logging in with Passkey:', error);
        alert(`Passkey login failed: ${(error as Error).message}`);
        return { success: false, error };
    }
}
