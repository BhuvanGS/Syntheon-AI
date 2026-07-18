import type { ReactNode } from 'react';
import { DocsShell } from '@/components/docs/docs-shell';
import { JsonLd, buildDocsBreadcrumbJsonLd } from '@/components/seo/json-ld';
import { docsMetadata } from '@/lib/docs-seo';

export const metadata = docsMetadata();

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd data={buildDocsBreadcrumbJsonLd()} />
      <DocsShell>{children}</DocsShell>
    </>
  );
}
