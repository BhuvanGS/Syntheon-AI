'use client';

import { TaskChooseOrganization } from '@clerk/nextjs';
import { BrandLogo } from '@/components/brand-logo';

/**
 * Completes Clerk's pending `choose-organization` session task.
 * Until this finishes, the session stays `pending` and is treated as signed-out —
 * which is what trapped new users on /onboarding.
 */
export function ChooseOrganizationTask() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center p-6"
      style={{ backgroundColor: '#0a0a0a' }}
    >
      <div className="mb-10 flex items-center gap-2.5">
        <BrandLogo size={32} />
        <span className="font-playfair text-xl font-bold text-foreground">Syntheon Hub</span>
      </div>
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="font-playfair text-3xl font-bold text-foreground">
            Set up your workspace
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Create an organization or join one you already belong to. This finishes signing you in.
          </p>
        </div>
        <div className="auth-clerk-wrap">
          <TaskChooseOrganization redirectUrlComplete="/dashboard" />
        </div>
      </div>
      <style jsx global>{`
        .auth-clerk-wrap .cl-rootBox,
        .auth-clerk-wrap .cl-card {
          width: 100% !important;
          max-width: 100% !important;
          box-shadow: none !important;
          background: transparent !important;
        }
        .auth-clerk-wrap .cl-cardBox {
          box-shadow: none !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 20px !important;
          background: rgba(255, 255, 255, 0.02) !important;
        }
      `}</style>
    </div>
  );
}
