import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from './trpc-router-fallback';

export const trpc = createTRPCReact<AppRouter>();
