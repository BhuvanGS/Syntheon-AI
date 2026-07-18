import Image from 'next/image';
import { cn } from '@/lib/utils';

type BrandLogoProps = {
  size?: number;
  className?: string;
  priority?: boolean;
  alt?: string;
};

/** Circular Syntheon Hub mark — use everywhere branding appears. */
export function BrandLogo({
  size = 28,
  className,
  priority = false,
  alt = 'Syntheon Hub',
}: BrandLogoProps) {
  return (
    <Image
      src="/syntheon-logo.png"
      alt={alt}
      width={size}
      height={size}
      priority={priority}
      className={cn('rounded-full object-cover shrink-0', className)}
      style={{ width: size, height: size }}
    />
  );
}
