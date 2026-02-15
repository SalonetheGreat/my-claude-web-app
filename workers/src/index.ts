import { Hono } from 'hono';
import type { Env } from './types';
import { corsMiddleware } from './middleware/cors';
import { errorHandler } from './middleware/error-handler';
import { health } from './routes/health';
import { notes } from './routes/notes';

const app = new Hono<{ Bindings: Env }>();

// Middleware
app.use('*', corsMiddleware);
app.use('*', errorHandler);

// Routes
app.route('/', health);
app.route('/', notes);

export default app;
