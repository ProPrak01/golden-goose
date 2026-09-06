alter table public.memories
  add column embedding vector(1536),
  add column embedding_provider text,
  add column embedding_model text,
  add column embedding_updated_at timestamptz;

create index memories_embedding_idx
  on public.memories using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

create or replace function public.match_memory_embeddings(
  query_embedding vector(1536),
  match_count integer default 20
)
returns table (id uuid, similarity double precision)
language sql
stable
as $$
  select
    memories.id,
    1 - (memories.embedding <=> query_embedding) as similarity
  from public.memories as memories
  where memories.status = 'active'
    and memories.embedding is not null
  order by memories.embedding <=> query_embedding
  limit match_count;
$$;
