
// TODO: Fix import - import { setupServer } from 'msw/node';
// TODO: Fix import - import React from "react";
import { handlers } from './handlers';



// Setup MSW server for testing environment
export const server = setupServer(...handlers);
