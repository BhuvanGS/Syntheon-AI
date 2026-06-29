import useSWR, { mutate as globalMutate } from 'swr';

export const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch');
  const data = await res.json();
  return Array.isArray(data) ? data : (data?.tickets ?? data);
};

export function projectTicketsKey(projectId: string | null | undefined) {
  return projectId ? `/api/tickets?projectId=${projectId}` : null;
}

export function useProjectTickets<T extends { id: string; status: string }>(
  projectId: string | null | undefined,
  fallbackTickets: T[] = []
) {
  const key = projectTicketsKey(projectId);
  const { data, error, isLoading, mutate } = useSWR<T[]>(key, fetcher, {
    fallbackData: fallbackTickets,
    revalidateOnFocus: false,
    revalidateOnMount: false,
    dedupingInterval: 5000,
  });

  return {
    tickets: data ?? fallbackTickets,
    error,
    isLoading,
    mutate,
  };
}

export { globalMutate };
