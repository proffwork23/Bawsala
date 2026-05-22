-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Create a table for teaching strategies
create table teaching_strategies (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  theory text,
  procedures text,
  tech_tool text,
  success_criteria text,
  strategy_type text, -- 'طريقة' or 'استراتيجية'
  content text not null, -- The full text content to be vectorized
  embedding vector(768), -- Google Gemini embeddings are 768 dimensions
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table teaching_strategies enable row level security;

-- Create policy for public read access
create policy "Allow public read access" on teaching_strategies
  for select using (true);

-- Create an index for faster similarity searches (using inner product)
create index on teaching_strategies using ivfflat (embedding vector_cosine_ops)
with (lists = 100);

-- Create a function to search for strategies
create or replace function match_strategies (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  name text,
  theory text,
  procedures text,
  tech_tool text,
  success_criteria text,
  strategy_type text,
  content text,
  similarity float
)
language sql stable
as $$
  select
    teaching_strategies.id,
    teaching_strategies.name,
    teaching_strategies.theory,
    teaching_strategies.procedures,
    teaching_strategies.tech_tool,
    teaching_strategies.success_criteria,
    teaching_strategies.strategy_type,
    teaching_strategies.content,
    1 - (teaching_strategies.embedding <=> query_embedding) as similarity
  from teaching_strategies
  where 1 - (teaching_strategies.embedding <=> query_embedding) > match_threshold
  order by teaching_strategies.embedding <=> query_embedding
  limit match_count;
$$;
