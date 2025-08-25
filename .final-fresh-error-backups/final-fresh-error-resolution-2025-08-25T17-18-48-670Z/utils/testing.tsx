// Clean minimal testing utilities stub to restore compiler health.
// Provides a tiny surface area used by tests: renderWithProviders, simple mock factories, userEvent setup.
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { render, type RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const createClient = () => new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });

interface TestProviderProps { children: React.ReactNode; client?: QueryClient }
const TestProviders: React.FC<TestProviderProps> = ({ children, client }) => (
	<QueryClientProvider client={client ?? createClient()}>
		<BrowserRouter>{children}</BrowserRouter>
	</QueryClientProvider>
);

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> { client?: QueryClient }
export function renderWithProviders(ui: React.ReactElement, options: CustomRenderOptions = {}) {
	const { client, ...rest } = options;
	return { user: userEvent.setup(), ...render(ui, { wrapper: (p) => <TestProviders client={client}>{p.children}</TestProviders>, ...rest }) };
}

// Very small mock object factories (kept intentionally generic)
export const mockFactories = {
	video: (over = {}) => ({ id: 'v_' + Math.random().toString(36).slice(2), title: 'Video', views: 0, ...over }),
	channel: (over = {}) => ({ id: 'c_' + Math.random().toString(36).slice(2), name: 'Channel', ...over }),
	playlist: (over = {}) => ({ id: 'p_' + Math.random().toString(36).slice(2), title: 'Playlist', videoIds: [], ...over })
};

export const testUtils = {
	wait: (ms = 0) => new Promise(r => setTimeout(r, ms)),
	user: () => userEvent.setup(),
	createClient
};

export { render as rtlRender };
export default TestProviders;