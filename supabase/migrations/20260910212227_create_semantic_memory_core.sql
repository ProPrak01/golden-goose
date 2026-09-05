create extension if not exists pgcrypto;
create extension if not exists vector;

create type public.memory_type as enum ('fact', 'preference', 'episode', 'pattern');
create type public.memory_status as enum ('candidate', 'active', 'superseded', 'soft_expired', 'deleted', 'rejected');
create type public.decision_kind as enum ('created', 'updated', 'rejected', 'superseded', 'soft_expired', 'deleted', 'corrected');
create type public.assistant_outcome as enum ('answered', 'clarified', 'abstained', 'tool_called');

create table public.transcripts (
  id uuid primary key default gen_random_uuid(),
  occurred_at timestamptz not null,
  source_app text,
  raw_asr text not null,
  formatted_text text not null,
  context jsonb not null default '{}'::jsonb,
  imported_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table public.memories (
  id uuid primary key default gen_random_uuid(),
  memory_type public.memory_type not null,
  status public.memory_status not null default 'candidate',
  subject_key text not null default 'self',
  canonical_statement text not null,
  payload jsonb not null default '{}'::jsonb,
  confidence numeric(4, 3) not null check (confidence >= 0 and confidence <= 1),
  occurred_at timestamptz,
  expires_at timestamptz,
  superseded_by uuid references public.memories(id),
  created_at timestamptz not null default now(),
  last_confirmed_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.memory_evidence (
  id uuid primary key default gen_random_uuid(),
  memory_id uuid not null references public.memories(id) on delete cascade,
  transcript_id uuid not null references public.transcripts(id) on delete restrict,
  excerpt text not null,
  source_start integer check (source_start is null or source_start >= 0),
  source_end integer check (source_end is null or source_end >= source_start),
  rationale text not null,
  created_at timestamptz not null default now(),
  unique (memory_id, transcript_id, excerpt)
);

create table public.memory_decisions (
  id uuid primary key default gen_random_uuid(),
  memory_id uuid references public.memories(id) on delete set null,
  transcript_id uuid references public.transcripts(id) on delete set null,
  kind public.decision_kind not null,
  reason text not null,
  decision_input jsonb not null default '{}'::jsonb,
  provider text not null default 'deterministic',
  model text,
  latency_ms integer check (latency_ms is null or latency_ms >= 0),
  input_tokens integer check (input_tokens is null or input_tokens >= 0),
  output_tokens integer check (output_tokens is null or output_tokens >= 0),
  estimated_cost_usd numeric(12, 8) check (estimated_cost_usd is null or estimated_cost_usd >= 0),
  created_at timestamptz not null default now()
);

create table public.retrieval_runs (
  id uuid primary key default gen_random_uuid(),
  query text not null,
  filters jsonb not null default '{}'::jsonb,
  selected_memory_ids uuid[] not null default '{}',
  selected_transcript_ids uuid[] not null default '{}',
  candidates jsonb not null default '[]'::jsonb,
  rationale text not null,
  latency_ms integer not null check (latency_ms >= 0),
  created_at timestamptz not null default now()
);

create table public.hey_kivi_runs (
  id uuid primary key default gen_random_uuid(),
  request text not null,
  retrieval_run_id uuid references public.retrieval_runs(id) on delete set null,
  outcome public.assistant_outcome not null,
  response text not null,
  reason text not null,
  provider text not null default 'deterministic',
  model text,
  latency_ms integer not null check (latency_ms >= 0),
  input_tokens integer check (input_tokens is null or input_tokens >= 0),
  output_tokens integer check (output_tokens is null or output_tokens >= 0),
  estimated_cost_usd numeric(12, 8) check (estimated_cost_usd is null or estimated_cost_usd >= 0),
  created_at timestamptz not null default now()
);

create table public.user_feedback (
  id uuid primary key default gen_random_uuid(),
  memory_id uuid references public.memories(id) on delete set null,
  hey_kivi_run_id uuid references public.hey_kivi_runs(id) on delete set null,
  action text not null check (action in ('corrected', 'deleted', 'soft_expired', 'dismissed')),
  detail text,
  replacement_statement text,
  created_at timestamptz not null default now(),
  check (memory_id is not null or hey_kivi_run_id is not null)
);

create index transcripts_occurred_at_idx on public.transcripts (occurred_at desc);
create index memories_status_type_idx on public.memories (status, memory_type);
create index memories_subject_status_idx on public.memories (subject_key, status);
create index evidence_memory_idx on public.memory_evidence (memory_id);
create index evidence_transcript_idx on public.memory_evidence (transcript_id);
create index decisions_memory_idx on public.memory_decisions (memory_id, created_at desc);
create index feedback_memory_idx on public.user_feedback (memory_id, created_at desc);

alter table public.transcripts enable row level security;
alter table public.memories enable row level security;
alter table public.memory_evidence enable row level security;
alter table public.memory_decisions enable row level security;
alter table public.retrieval_runs enable row level security;
alter table public.hey_kivi_runs enable row level security;
alter table public.user_feedback enable row level security;
