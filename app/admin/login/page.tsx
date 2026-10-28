'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, ArrowRight, AlertCircle, Info, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const supabase = createClient();
      if (!supabase) {
        throw new Error('Authentication service is not configured. Please check your environment variables.');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Confirm user has administrative role
        const { data: profile, error: profErr } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (profErr || !profile || profile.role !== 'admin') {
          await supabase.auth.signOut();
          throw new Error('Access denied: Your account does not have administrative privileges.');
        }

        router.push('/admin');
        router.refresh();
      }
    } catch (err: unknown) {
      console.error('Admin login error:', err);
      const msg = err instanceof Error ? err.message : 'Invalid credentials. Please verify your email and password.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const configured = isSupabaseConfigured();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 bg-[#FAF7F0] py-12">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 border border-[#E6DCD1] rounded-xs shadow-md">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-block">
            <span className="font-serif text-3xl tracking-wider text-[#702638] font-bold">
              KAMINI
            </span>
            <span className="block text-[11px] tracking-[0.25em] text-[#B99A5B] font-semibold uppercase">
              Admin Portal
            </span>
          </Link>
          <h2 className="mt-4 font-serif text-xl font-normal text-[#26221F]">
            Sign In to Manage Store
          </h2>
          <p className="text-xs text-[#645E59] mt-1">
            Authorized store owner and staff credentials required
          </p>
        </div>

        {!configured && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xs flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <div className="leading-relaxed">
              <strong>Configuration Notice:</strong> Supabase environment variables are currently in template mode in <code>.env.example</code>. Click below to preview the admin interface.
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#26221F] mb-1">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#645E59] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@kaminicollections.com"
                required={configured}
                className="w-full bg-[#FAF7F0] border border-[#E6DCD1] rounded-xs py-2.5 pl-10 pr-3 text-sm focus:outline-none focus:border-[#702638]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#26221F] mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#645E59] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required={configured}
                className="w-full bg-[#FAF7F0] border border-[#E6DCD1] rounded-xs py-2.5 pl-10 pr-3 text-sm focus:outline-none focus:border-[#702638]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-[#702638] hover:bg-[#591D2B] text-white py-3.5 rounded-xs font-semibold text-xs tracking-wider uppercase transition-all shadow-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying Access...</span>
              </>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-[#E6DCD1] text-center">
          <Link
            href="/"
            className="text-xs font-medium text-[#702638] hover:underline"
          >
            ← Return to Public Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
