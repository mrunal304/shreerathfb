import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export interface AnalyticsFilter {
  dateFrom?: string;
  dateTo?: string;
}

export function useAnalytics(filter: AnalyticsFilter = {}) {
  // Use primitive values in the query key so React Query always detects changes correctly
  return useQuery({
    queryKey: [api.analytics.get.path, filter.dateFrom ?? '', filter.dateTo ?? ''],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filter.dateFrom) params.set('dateFrom', filter.dateFrom);
      if (filter.dateTo) params.set('dateTo', filter.dateTo);
      const url = `${api.analytics.get.path}?${params.toString()}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return api.analytics.get.responses[200].parse(await res.json());
    },
    staleTime: 0,
  });
}
