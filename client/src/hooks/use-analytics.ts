import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useAnalytics(period: 'week' | 'month' = 'week') {
  return useQuery({
    queryKey: [api.analytics.get.path, period],
    queryFn: async () => {
      const url = `${api.analytics.get.path}?period=${period}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return api.analytics.get.responses[200].parse(await res.json());
    },
  });
}
