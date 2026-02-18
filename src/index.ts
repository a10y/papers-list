import { Router, type IRequest } from 'itty-router';
import { getPapers } from './routes/papers';
import { getPaper } from './routes/paper';

const router = Router();

// API routes
router.get('/api/papers', (request: IRequest, env: Env) => getPapers(request, env));
router.get('/api/papers/:id', (request: IRequest, env: Env) => getPaper(request, env));

// All other routes are handled by static assets (SPA)
router.all('*', (request: IRequest, env: Env) => env.ASSETS.fetch(request));

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		return router.fetch(request, env, ctx);
	},
} satisfies ExportedHandler<Env>;
