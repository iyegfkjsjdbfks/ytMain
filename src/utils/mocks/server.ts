import { setupServer } from 'msw/node';
import { handlers } from 'handlers.ts';

// Setup MSW server for testing environment
export const server = setupServer(...handlers);
