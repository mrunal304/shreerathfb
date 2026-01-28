import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { InsertFeedback, Feedback, ContactUpdate } from "@shared/schema";

// Helper to ensure dates are Date objects not strings
const parseFeedback = (item: any): Feedback => ({
  ...item,
  createdAt: item.createdAt ? new Date(item.createdAt) : undefined,
  contactedAt: item.contactedAt ? new Date(item.contactedAt) : undefined,
});

export function useFeedback(params?: { page?: number; limit?: number; search?: string; date?: string; rating?: number }) {
  return useQuery({
    queryKey: [api.feedback.list.path, params],
    queryFn: async () => {
      // Build query string
      const queryParams: Record<string, string | number> = {};
      if (params?.page) queryParams.page = params.page;
      if (params?.limit) queryParams.limit = params.limit;
      if (params?.search) queryParams.search = params.search;
      if (params?.date) queryParams.date = params.date;
      if (params?.rating) queryParams.rating = params.rating;

      const url = params ? `${api.feedback.list.path}?${new URLSearchParams(queryParams as any)}` : api.feedback.list.path;
      
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch feedback");
      
      const raw = await res.json();
      const validated = api.feedback.list.responses[200].parse(raw);
      
      return {
        ...validated,
        data: validated.data.map(parseFeedback),
      };
    },
    placeholderData: (previousData) => previousData,
  });
}

export function useCreateFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertFeedback) => {
      // Validate with shared schema first
      const validatedInput = api.feedback.create.input.parse(data);
      
      const res = await fetch(api.feedback.create.path, {
        method: api.feedback.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validatedInput),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.feedback.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        if (res.status === 409) {
           const error = api.feedback.create.responses[409].parse(await res.json());
           throw new Error(error.message);
        }
        throw new Error("Failed to submit feedback");
      }
      
      return api.feedback.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      // Don't invalidate list immediately to avoid jank if user is admin, 
      // but good practice generally.
      queryClient.invalidateQueries({ queryKey: [api.feedback.list.path] });
    },
  });
}

export function useMarkContacted() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ContactUpdate }) => {
      const validatedInput = api.feedback.markContacted.input.parse(data);
      const url = buildUrl(api.feedback.markContacted.path, { id });
      
      const res = await fetch(url, {
        method: api.feedback.markContacted.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validatedInput),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 404) throw new Error("Feedback not found");
        throw new Error("Failed to update status");
      }
      
      return api.feedback.markContacted.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.feedback.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.analytics.get.path] });
    },
  });
}
