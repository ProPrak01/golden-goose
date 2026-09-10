create or replace function public.get_kivi_storage_metrics()
returns table (
  relation_name text,
  row_count bigint,
  table_bytes bigint,
  index_bytes bigint,
  total_bytes bigint
)
language sql
stable
set search_path = pg_catalog, public
as $$
  select
    metric.relation_name,
    metric.row_count,
    pg_table_size(metric.relation_name::regclass) as table_bytes,
    pg_indexes_size(metric.relation_name::regclass) as index_bytes,
    pg_total_relation_size(metric.relation_name::regclass) as total_bytes
  from (
    select 'transcripts'::text as relation_name, count(*)::bigint as row_count from public.transcripts
    union all select 'memories', count(*)::bigint from public.memories
    union all select 'memory_evidence', count(*)::bigint from public.memory_evidence
    union all select 'memory_decisions', count(*)::bigint from public.memory_decisions
    union all select 'retrieval_runs', count(*)::bigint from public.retrieval_runs
    union all select 'hey_kivi_runs', count(*)::bigint from public.hey_kivi_runs
    union all select 'user_feedback', count(*)::bigint from public.user_feedback
  ) as metric
  order by metric.relation_name;
$$;
