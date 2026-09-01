-- Defesa em profundidade: nenhuma chamada direta pode ler ou alterar as tabelas.
-- O app usa exclusivamente as funções SECURITY DEFINER da migração principal.

create policy game_runs_no_direct_access
  on private.game_runs
  for all
  to anon, authenticated
  using (false)
  with check (false);

create policy game_scores_no_direct_access
  on private.game_scores
  for all
  to anon, authenticated
  using (false)
  with check (false);
