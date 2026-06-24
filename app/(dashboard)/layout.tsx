import { SseProvider } from '@/components/sse-provider';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <SseProvider>{children}</SseProvider>;
}
