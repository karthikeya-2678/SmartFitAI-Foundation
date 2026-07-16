import { supabase } from '@/lib/supabase';

export const authService = {
  // ─── Email / Password ────────────────────────────────────────────────────────

  signInWithEmail: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  signUpWithEmail: async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw error;
    return data;
  },

  // ─── Phone / OTP ─────────────────────────────────────────────────────────────

  sendPhoneOTP: async (phone: string) => {
    const { error } = await supabase.auth.signInWithOtp({ phone });
    if (error) throw error;
  },

  sendEmailOTP: async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) throw error;
  },

  verifyPhoneOTP: async (phone: string, token: string) => {
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms',
    });
    if (error) throw error;
    return data;
  },

  verifyEmailOTP: async (email: string, token: string, type: 'email' | 'signup' = 'email') => {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type,
    });
    if (error) throw error;
    return data;
  },

  // ─── Password Reset ───────────────────────────────────────────────────────────

  resetPasswordForEmail: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  },

  // ─── OAuth ───────────────────────────────────────────────────────────────────

  getGoogleOAuthUrl: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { skipBrowserRedirect: true },
    });
    if (error) throw error;
    return data.url;
  },

  // ─── Session ─────────────────────────────────────────────────────────────────

  getSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
};
