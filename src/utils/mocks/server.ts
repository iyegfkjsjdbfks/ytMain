import React from "react";
import { setupServer } from 'msw/node';
import React from "react";
import { handlers } from './handlers';



// Setup MSW server for testing environment
export const server = setupServer(...handlers);
