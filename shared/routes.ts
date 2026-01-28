import { z } from "zod";
import { feedbackSchema, insertFeedbackSchema, loginSchema, contactUpdateSchema, objectIdSchema } from "./schema";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
  conflict: z.object({
    message: z.string(),
  })
};

export const api = {
  feedback: {
    create: {
      method: 'POST' as const,
      path: '/api/feedback',
      input: insertFeedbackSchema,
      responses: {
        201: feedbackSchema.extend({ _id: objectIdSchema }),
        400: errorSchemas.validation,
        409: errorSchemas.conflict, // For duplicate submissions
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/feedback',
      input: z.object({
        page: z.coerce.number().optional(),
        limit: z.coerce.number().optional(),
        search: z.string().optional(),
        date: z.string().optional(),
        rating: z.coerce.number().optional(),
      }).optional(),
      responses: {
        200: z.object({
          data: z.array(feedbackSchema.extend({ _id: objectIdSchema })),
          pagination: z.object({
            total: z.number(),
            page: z.number(),
            limit: z.number(),
            pages: z.number(),
          }),
        }),
      },
    },
    markContacted: {
      method: 'PATCH' as const,
      path: '/api/feedback/:id/contact',
      input: contactUpdateSchema,
      responses: {
        200: feedbackSchema.extend({ _id: objectIdSchema }),
        404: errorSchemas.notFound,
      },
    },
  },
  analytics: {
    get: {
      method: 'GET' as const,
      path: '/api/analytics',
      input: z.object({
        period: z.enum(['week', 'month']).optional(),
      }).optional(),
      responses: {
        200: z.custom<import('./schema').AnalyticsData>(),
      },
    },
  },
  auth: {
    login: {
      method: 'POST' as const,
      path: '/api/login',
      input: loginSchema,
      responses: {
        200: z.object({ message: z.string(), user: z.object({ username: z.string(), role: z.string() }) }),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout',
      responses: {
        200: z.object({ message: z.string() }),
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/user',
      responses: {
        200: z.object({ username: z.string(), role: z.string() }).nullable(),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
