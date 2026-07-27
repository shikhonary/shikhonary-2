import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { UseFormRegister, FieldErrors, UseFormSetValue, Control, useWatch } from 'react-hook-form';
import { RegisterInput } from '../pages/RegisterPage';

interface RegisterFormProps {
  register: UseFormRegister<RegisterInput>;
  errors: FieldErrors<RegisterInput>;
  setValue: UseFormSetValue<RegisterInput>;
  control: Control<RegisterInput>;
  loading: boolean;
  error: string | null;
  onSubmit: (e: React.FormEvent) => void;
}

export default function RegisterForm({
  register,
  errors,
  setValue,
  control,
  loading,
  error,
  onSubmit,
}: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const agreed = useWatch({
    control,
    name: 'agreed',
    defaultValue: false,
  });

  return (
    <div>
      {/* Logo & Header */}
      <div className="flex flex-col items-center mb-10">
        <Image
          alt="Basic Education Care Logo"
          src="/logo.jpg"
          width={200}
          height={64}
          priority
          className="h-16 w-auto mb-8 object-contain"
        />
        <h1 className="font-headline-md text-headline-md text-on-surface text-center mb-2">
          Create an Account
        </h1>
        <p className="font-body-md text-on-surface-variant text-center">
          Join <span className="font-bold text-primary">BEC</span> workstation
        </p>
      </div>

      {/* Server Error Banner */}
      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span className="material-symbols-outlined text-[18px] mt-px shrink-0">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Register Form */}
      <form className="space-y-6" onSubmit={onSubmit} noValidate>
        {/* Full Name Input */}
        <div className="space-y-1">
          <div className="floating-label-group relative">
            <Input
              {...register('name')}
              disabled={loading}
              className={`w-full h-14 px-4 border bg-white rounded-lg focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container transition-all duration-200 outline-none text-on-surface peer placeholder:text-transparent ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-outline-variant'
                }`}
              id="fullName"
              placeholder="Full Name"
              type="text"
              autoComplete="name"
            />
            <label
              className="absolute left-4 top-4 text-on-surface-variant transition-all duration-200 pointer-events-none peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:text-primary-container peer-focus:bg-white peer-focus:px-1 peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-primary-container peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1"
              htmlFor="fullName"
            >
              Full Name
            </label>
          </div>
          {errors.name && (
            <p className="text-xs text-red-500 pl-1">{errors.name.message}</p>
          )}
        </div>

        {/* Email Input */}
        <div className="space-y-1">
          <div className="floating-label-group relative">
            <Input
              {...register('email')}
              disabled={loading}
              className={`w-full h-14 px-4 border bg-white rounded-lg focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container transition-all duration-200 outline-none text-on-surface peer placeholder:text-transparent ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-outline-variant'
                }`}
              id="email"
              placeholder="Email Address"
              type="email"
              autoComplete="email"
            />
            <label
              className="absolute left-4 top-4 text-on-surface-variant transition-all duration-200 pointer-events-none peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:text-primary-container peer-focus:bg-white peer-focus:px-1 peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-primary-container peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1"
              htmlFor="email"
            >
              Email Address
            </label>
          </div>
          {errors.email && (
            <p className="text-xs text-red-500 pl-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password Input */}
        <div className="space-y-2">
          <div className="space-y-1">
            <div className="floating-label-group relative">
              <Input
                {...register('password')}
                disabled={loading}
                className={`w-full h-14 pl-4 pr-12 border bg-white rounded-lg focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container transition-all duration-200 outline-none text-on-surface peer placeholder:text-transparent ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-outline-variant'
                  }`}
                id="password"
                placeholder="Password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
              />
              <label
                className="absolute left-4 top-4 text-on-surface-variant transition-all duration-200 pointer-events-none peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:text-primary-container peer-focus:bg-white peer-focus:px-1 peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-primary-container peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1"
                htmlFor="password"
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface select-none focus:outline-none flex items-center justify-center cursor-pointer disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500 pl-1">{errors.password.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1 mt-4">
            <label className="flex items-center gap-2 cursor-pointer group">
              <Checkbox
                className="w-4 h-4 rounded border-outline text-primary-container data-checked:bg-primary-container data-checked:border-primary-container focus:ring-primary-container cursor-pointer"
                checked={agreed}
                disabled={loading}
                onCheckedChange={(v) => setValue('agreed', v === true, { shouldValidate: true })}
              />
              <span className="text-label-sm text-on-surface-variant group-hover:text-on-surface transition-colors">
                I agree to the <Link href="/terms-of-service" className='hover:underline'>Terms of Service</Link>
              </span>
            </label>
            {errors.agreed && (
              <p className="text-xs text-red-500 pl-1">{errors.agreed.message}</p>
            )}
          </div>
        </div>

        {/* Register Button */}
        <Button
          className="w-full h-14 bg-primary-container !text-white font-headline-md text-[18px] rounded-lg hover:opacity-90 active:scale-[0.98] transition-all duration-200 shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          type="submit"
          disabled={loading}
          variant="default"
        >
          {loading ? (
            <>
              <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
              <span>Creating account...</span>
            </>
          ) : (
            <>
              <span>Sign Up</span>
              <span className="material-symbols-outlined text-[20px]">person_add</span>
            </>
          )}
        </Button>
      </form>

      {/* Login Link */}
      <div className="mt-10 pt-6 border-t border-outline-variant/30 text-center">
        <p className="font-body-md text-on-surface-variant">
          Already have an account?
          <Link
            className={`text-primary font-bold hover:underline ml-1 ${loading ? 'pointer-events-none opacity-50' : ''
              }`}
            href="/auth/sign-in"
            onClick={(e) => loading && e.preventDefault()}
            prefetch
          >
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}
