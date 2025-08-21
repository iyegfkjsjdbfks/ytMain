// Minimal test utils stub replacing corrupted original.
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const qc = () => new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });

export function simpleRender(ui: React.ReactElement, opts: { client?: QueryClient } = {}) {
	const client = opts.client ?? qc();
	const Wrapper = (p) => (
		<QueryClientProvider client={client}>
			<MemoryRouter>{p.children}</MemoryRouter>
		</QueryClientProvider>
	);
	return { user: userEvent.setup(), ...render(ui, { wrapper: Wrapper }) };
}

export const generators = {
	video: (o = {}) => ({ id: 'v_' + Math.random().toString(36).slice(2), title: 'Video', views: 0, ...o }),
	channel: (o = {}) => ({ id: 'c_' + Math.random().toString(36).slice(2), name: 'Channel', ...o }),
	user: (o = {}) => ({ id: 'u_' + Math.random().toString(36).slice(2), username: 'user', ...o })
};

export const testUtils = { wait: (ms = 0) => new Promise(r => setTimeout(r, ms)), generators };

export { userEvent };
