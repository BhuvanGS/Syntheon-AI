'use client';

import { useOrganization, useUser } from '@clerk/nextjs';
import { ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { selectTriggerClassName } from '@/components/ui/select';
import { cn } from '@/lib/utils';

export interface AssigneeValue {
  displayName: string;
  userId: string;
}

interface AssigneePickerProps {
  value: AssigneeValue | null;
  onChange: (value: AssigneeValue | null) => void;
  disabled?: boolean;
}

export function AssigneePicker({ value, onChange, disabled }: AssigneePickerProps) {
  const { user } = useUser();
  const { memberships } = useOrganization({ memberships: { infinite: true, pageSize: 50 } });

  const members = (memberships?.data ?? []).map((m) => {
    const firstName = m.publicUserData?.firstName ?? '';
    const lastName = m.publicUserData?.lastName ?? '';
    const email = m.publicUserData?.identifier ?? '';
    const displayName = [firstName, lastName].filter(Boolean).join(' ') || email;
    return {
      userId: m.publicUserData?.userId ?? '',
      displayName,
    };
  });

  const myDisplayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    user?.emailAddresses?.[0]?.emailAddress ||
    'Me';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <button type="button" className={cn(selectTriggerClassName, 'text-left')}>
          <span className="truncate">{value ? value.displayName : 'Unassigned'}</span>
          <ChevronDown />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)]">
        {user && (
          <>
            <DropdownMenuItem
              onClick={() => onChange({ userId: user.id, displayName: myDisplayName })}
              className="cursor-pointer"
            >
              {myDisplayName}
              <span className="ml-auto text-xs text-muted-foreground">Me</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {members
          .filter((m) => m.userId !== user?.id)
          .map((m) => (
            <DropdownMenuItem
              key={m.userId}
              onClick={() => onChange({ userId: m.userId, displayName: m.displayName })}
              className="cursor-pointer"
            >
              <span className="truncate">{m.displayName}</span>
            </DropdownMenuItem>
          ))}

        {members.length === 0 && (
          <DropdownMenuItem disabled className="text-xs text-muted-foreground">
            No other members
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onChange(null)}
          className="cursor-pointer text-muted-foreground"
        >
          Unassigned
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
