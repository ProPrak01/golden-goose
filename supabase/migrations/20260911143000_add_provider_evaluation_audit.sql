create table public.provider_evaluation_runs (
  id uuid primary key default gen_random_uuid(),
  corpus_name text not null,
  corpus_sha256 text not null,
  provider text not null,
  model text not null,
  status text not null check (status in ('running', 'completed', 'failed')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  record_count integer not null check (record_count >= 0),
  summary jsonb,
  created_at timestamptz not null default now()
);

create table public.provider_evaluation_records (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.provider_evaluation_runs(id) on delete cascade,
  corpus_record_id text not null,
  transcript jsonb not null,
  expected_decision text check (expected_decision in ('accept', 'clarify', 'reject')),
  actual_decision text not null check (actual_decision in ('accept', 'clarify', 'reject')),
  candidate_count integer not null check (candidate_count >= 0),
  evidence_valid boolean not null,
  extraction jsonb not null,
  raw_provider_response jsonb not null,
  provider text not null,
  model text not null,
  latency_ms integer not null check (latency_ms >= 0),
  input_tokens integer,
  output_tokens integer,
  estimated_cost_usd numeric(12, 8),
  created_at timestamptz not null default now(),
  unique (run_id, corpus_record_id)
);

create index provider_evaluation_records_run_idx
  on public.provider_evaluation_records (run_id, corpus_record_id);

alter table public.provider_evaluation_runs enable row level security;
alter table public.provider_evaluation_records enable row level security;
