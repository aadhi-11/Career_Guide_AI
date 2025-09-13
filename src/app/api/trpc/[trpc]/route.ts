import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouterFallback } from '@/lib/trpc-router-fallback';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouterFallback,
    createContext: () => ({}),
  });

export { handler as GET, handler as POST };
