-- TAREFAS Android 1.9.7 beta: jogo do dinossauro e placar público.
-- As tabelas ficam no schema privado; o app acessa somente as RPCs abaixo.

create table if not exists private.game_runs (
  run_hash text primary key,
  usuario_id bigint not null references public.usuarios(id) on delete cascade,
  game_key text not null check (game_key in ('dino')),
  started_at timestamptz not null default now(),
  expires_at timestamptz not null,
  finished_at timestamptz,
  submitted_score integer check (submitted_score between 0 and 10000000),
  client_duration_ms integer check (client_duration_ms between 1000 and 7200000)
);

create table if not exists private.game_scores (
  id bigint generated always as identity primary key,
  run_hash text not null unique references private.game_runs(run_hash) on delete restrict,
  usuario_id bigint not null references public.usuarios(id) on delete cascade,
  game_key text not null check (game_key in ('dino')),
  score integer not null check (score between 0 and 10000000),
  duration_ms integer not null check (duration_ms between 1000 and 7200000),
  achieved_at timestamptz not null default now()
);

create index if not exists game_runs_user_game_started_idx
  on private.game_runs (usuario_id, game_key, started_at desc);
create index if not exists game_runs_expires_idx
  on private.game_runs (expires_at);
create index if not exists game_scores_game_rank_idx
  on private.game_scores (game_key, score desc, achieved_at asc, usuario_id);
create index if not exists game_scores_user_game_rank_idx
  on private.game_scores (usuario_id, game_key, score desc, achieved_at asc);

alter table private.game_runs enable row level security;
alter table private.game_scores enable row level security;

revoke all on table private.game_runs from public, anon, authenticated;
revoke all on table private.game_scores from public, anon, authenticated;
revoke all on sequence private.game_scores_id_seq from public, anon, authenticated;

create or replace function public.v1_9_7_start_game_run(
  p_session_token text,
  p_game_key text default 'dino'
)
returns text
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_user_id bigint;
  v_run_token text;
  v_run_hash text;
begin
  if coalesce(length(trim(p_session_token)), 0) < 32 then
    raise exception 'SESSAO_INVALIDA';
  end if;
  if p_game_key is distinct from 'dino' then
    raise exception 'JOGO_INVALIDO';
  end if;

  v_user_id := private.v196_session_user(p_session_token);
  if v_user_id is null then
    raise exception 'SESSAO_EXPIRADA';
  end if;

  delete from private.game_runs
  where usuario_id = v_user_id
    and game_key = p_game_key
    and finished_at is null;

  v_run_token := encode(extensions.gen_random_bytes(32), 'hex');
  v_run_hash := encode(extensions.digest(v_run_token, 'sha256'), 'hex');

  insert into private.game_runs (
    run_hash, usuario_id, game_key, started_at, expires_at
  ) values (
    v_run_hash, v_user_id, p_game_key, now(), now() + interval '2 hours'
  );

  return v_run_token;
end;
$function$;

create or replace function public.v1_9_7_submit_game_score(
  p_session_token text,
  p_run_token text,
  p_game_key text,
  p_score integer,
  p_duration_ms integer
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_user_id bigint;
  v_run private.game_runs%rowtype;
  v_elapsed_ms bigint;
  v_score_cap bigint;
  v_personal_best integer;
  v_rank bigint;
begin
  if coalesce(length(trim(p_session_token)), 0) < 32 then
    raise exception 'SESSAO_INVALIDA';
  end if;
  if coalesce(length(trim(p_run_token)), 0) < 32 then
    raise exception 'PARTIDA_INVALIDA';
  end if;
  if p_game_key is distinct from 'dino' then
    raise exception 'JOGO_INVALIDO';
  end if;
  if p_score is null or p_score < 0 or p_score > 10000000 then
    raise exception 'PONTUACAO_INVALIDA';
  end if;
  if p_duration_ms is null or p_duration_ms < 1000 or p_duration_ms > 7200000 then
    raise exception 'DURACAO_INVALIDA';
  end if;

  v_user_id := private.v196_session_user(p_session_token);
  if v_user_id is null then
    raise exception 'SESSAO_EXPIRADA';
  end if;

  select r.*
    into v_run
  from private.game_runs r
  where r.run_hash = encode(extensions.digest(p_run_token, 'sha256'), 'hex')
    and r.usuario_id = v_user_id
    and r.game_key = p_game_key
  for update;

  if not found then
    raise exception 'PARTIDA_INVALIDA';
  end if;
  if v_run.finished_at is not null then
    raise exception 'PARTIDA_JA_ENVIADA';
  end if;
  if v_run.expires_at <= now() then
    raise exception 'PARTIDA_EXPIRADA';
  end if;

  v_elapsed_ms := greatest(1, floor(extract(epoch from (now() - v_run.started_at)) * 1000)::bigint);
  if p_duration_ms > v_elapsed_ms + 5000
     or p_duration_ms < greatest(1000, v_elapsed_ms - 15000) then
    raise exception 'DURACAO_INCOMPATIVEL';
  end if;

  -- O cliente chega no máximo a 70 pontos/s. A margem cobre variações de frame/rede.
  v_score_cap := floor((least(p_duration_ms::bigint, v_elapsed_ms + 2500) / 1000.0) * 75)::bigint + 150;
  if p_score > v_score_cap then
    raise exception 'PONTUACAO_INCOMPATIVEL';
  end if;

  update private.game_runs
  set finished_at = now(),
      submitted_score = p_score,
      client_duration_ms = p_duration_ms
  where run_hash = v_run.run_hash;

  insert into private.game_scores (
    run_hash, usuario_id, game_key, score, duration_ms
  ) values (
    v_run.run_hash, v_user_id, p_game_key, p_score, p_duration_ms
  );

  with best as (
    select distinct on (s.usuario_id)
      s.usuario_id, s.score, s.achieved_at
    from private.game_scores s
    where s.game_key = p_game_key
    order by s.usuario_id, s.score desc, s.achieved_at asc
  ), ranked as (
    select
      b.usuario_id,
      b.score,
      row_number() over (
        order by b.score desc, b.achieved_at asc, b.usuario_id asc
      ) as rank_no
    from best b
  )
  select r.score, r.rank_no
    into v_personal_best, v_rank
  from ranked r
  where r.usuario_id = v_user_id;

  return jsonb_build_object(
    'score', p_score,
    'personal_best', v_personal_best,
    'rank', v_rank
  );
end;
$function$;

create or replace function public.v1_9_7_games_leaderboard(
  p_game_key text default 'dino',
  p_limit integer default 50
)
returns table (
  ranking bigint,
  usuario_id bigint,
  jogador text,
  score integer,
  achieved_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $function$
  with best as (
    select distinct on (s.usuario_id)
      s.usuario_id, s.score, s.achieved_at
    from private.game_scores s
    where s.game_key = case when p_game_key = 'dino' then p_game_key else 'dino' end
    order by s.usuario_id, s.score desc, s.achieved_at asc
  ), ranked as (
    select
      row_number() over (
        order by b.score desc, b.achieved_at asc, b.usuario_id asc
      ) as rank_no,
      b.usuario_id,
      trim(concat_ws(' ', u.patente, u.nome_guerra)) as jogador,
      b.score,
      b.achieved_at
    from best b
    join public.usuarios u on u.id = b.usuario_id
    where u.ativo is true
  )
  select r.rank_no as ranking, r.usuario_id, r.jogador, r.score, r.achieved_at
  from ranked r
  order by r.rank_no
  limit least(greatest(coalesce(p_limit, 50), 1), 100)
$function$;

revoke all on function public.v1_9_7_start_game_run(text, text) from public;
revoke all on function public.v1_9_7_submit_game_score(text, text, text, integer, integer) from public;
revoke all on function public.v1_9_7_games_leaderboard(text, integer) from public;

grant execute on function public.v1_9_7_start_game_run(text, text) to anon, authenticated;
grant execute on function public.v1_9_7_submit_game_score(text, text, text, integer, integer) to anon, authenticated;
grant execute on function public.v1_9_7_games_leaderboard(text, integer) to anon, authenticated;

comment on function public.v1_9_7_start_game_run(text, text)
  is 'Inicia uma partida autenticada do Dinossauro e retorna um token descartável.';
comment on function public.v1_9_7_submit_game_score(text, text, text, integer, integer)
  is 'Valida e registra a pontuação de uma partida autenticada.';
comment on function public.v1_9_7_games_leaderboard(text, integer)
  is 'Lista a melhor pontuação pública de cada jogador.';
