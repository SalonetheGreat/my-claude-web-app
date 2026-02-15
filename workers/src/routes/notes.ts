import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { createSupabaseClient } from '../lib/supabase';
import type { Env, Note } from '../types';

const notes = new Hono<{ Bindings: Env }>();

notes.get('/notes', async (c) => {
  const supabase = createSupabaseClient(c.env);

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    throw new HTTPException(500, { message: error.message });
  }

  return c.json(data as Note[]);
});

notes.post('/notes', async (c) => {
  const body = await c.req.json<{ content?: string }>();

  if (!body.content?.trim()) {
    throw new HTTPException(400, { message: 'content is required' });
  }

  const supabase = createSupabaseClient(c.env);

  const { data, error } = await supabase
    .from('notes')
    .insert({ content: body.content.trim() })
    .select()
    .single();

  if (error) {
    throw new HTTPException(500, { message: error.message });
  }

  return c.json(data as Note, 201);
});

export { notes };
