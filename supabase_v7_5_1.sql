-- TAREFAS V7.5.1
-- Substituição muda o executor do serviço, mas preserva o dono do rodízio/folgas.
-- Migration aplicada no Supabase em 28/08/2026.

alter table public.escala_servicos
  add column if not exists rodizio_usuario_id bigint references public.usuarios(id) on delete set null;

alter table public.escala_servicos
  add column if not exists rodizio_pessoa_externa_id bigint references public.pessoal_nomes_externos(id) on delete set null;

-- As RPCs v7_5_1_substituir_servico e v7_5_1_substituir_servico_canil
-- gravam a identidade original do rodízio antes de trocar o executor.
-- O frontend usa rodizio_* somente no cálculo projetado; na tabela continua
-- exibindo usuario_id/pessoa_externa_id, isto é, quem realmente executará o serviço.
