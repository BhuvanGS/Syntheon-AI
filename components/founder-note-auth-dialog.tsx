'use client';

import { useState } from 'react';
import { WelcomeDialog } from '@/components/welcome-dialog';

export function FounderNoteAuthDialog() {
  const [open, setOpen] = useState(true);

  return <WelcomeDialog open={open} onClose={() => setOpen(false)} />;
}
