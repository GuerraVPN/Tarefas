-- TAREFAS Alpha 2.4.8.2
-- Correção de permissões da função de pendências de carga e normalização das guias prontas.
grant execute on function public.v7_7_0_criar_pendencia_carga(text,text,text,bigint,text,text) to anon, authenticated;

update public.guias_orcamentarias
set etapa_orcamentaria='pronto'
where status='pronto'
  and etapa_orcamentaria is distinct from 'pronto';
