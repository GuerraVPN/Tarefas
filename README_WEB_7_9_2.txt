TAREFAS Web 7.9.2

Foco da versão
- Corrigir e reconstruir o Painel SITE.
- Garantir aviso global e redirecionamento correto para usuários comuns.
- Preservar perfis Admin durante ações administrativas.
- Reduzir polling e consumo de CPU da camada Web.
- Endurecer Favoritos, Filtros e fila offline da Central 2.0.

Painel SITE 7.9.2
- Novo controlador único: v7_9_1_site.js.
- Detecta Admin por RPC 7.4.12 e possui fallback por usuario_perfis.
- Consulta estado com fallback: v7_4_12_estado_site -> v7_4_9_estado_site -> v7_4_7_estado_site.
- Executa ações com fallback: v7_4_12_controle_site -> v7_4_9_controle_site -> v7_4_7_controle_site.
- EXIT USERS: avisa usuários comuns, encerra sessão e redireciona para index.html.
- Reiniciar: avisa usuários comuns e redireciona para reiniciar.html.
- Desligar: avisa usuários comuns e redireciona para desligado.html.
- Perfis Admin não são expulsos, reiniciados nem bloqueados pelas ações.
- Durante os 30 segundos anteriores à ação, um aviso global com contagem regressiva é mostrado.
- O Admin tenta enviar também uma notificação persistente para todos os usuários comuns.
- Reiniciar possui proteção contra loop de redirecionamento.
- Desligado consulta o estado do SITE e libera automaticamente quando o Admin iniciar novamente.

Central / Favoritos / Filtros
- Núcleo Web promovido para v7_9_1_web.js.
- Filtros salvos recebem schemaVersion 1.
- Estado antigo da 7.9.0 é migrado sem apagar Favoritos/Filtros existentes.
- Favoritos duplicados por URL são consolidados.
- Favoritos passam a poder ser renomeados.
- Fila offline mostra pendências/falhas e permite nova tentativa.
- Consulta de notificações usa token de ciclo de tela para ignorar resposta obsoleta.

Desempenho
- Removido polling do Calendário a cada 350 ms.
- Removido polling de labels de serviço a cada 1,2 s.
- Removido polling do editor de serviço a cada 2 s.
- Removida reconstrução global de UI a cada 3 s.
- Removida sincronização periódica de webfix a cada 30 s.
- Esses fluxos passam a reagir a eventos e MutationObservers limitados.

Telas administrativas
- reiniciar.html: limpa cache/runtime e retorna ao sistema.
- desligado.html: mantém usuários comuns aguardando até o SITE ser iniciado.
- Login mostra mensagem específica após EXIT USERS.

Compatibilidade
- Mantém a Web 7.9.0 como base funcional.
- Mantém compatibilidade com os RPCs antigos enquanto a instalação do TAREFAS ainda tiver camadas 7.4.x.


## Web 7.9.2 — Distribuição + Escalas
- Corrigida a camada Web do fluxo de aprovação/retorno da Distribuição para usar o RPC v5_4_2_mover_distribuicao com bloqueio contra duplo clique e tratamento explícito do erro legado de referência ambígua em motivo.
- Navegação consolidada em Serviços → Escalas, usando pessoal.html / pessoal_v7.js como implementação única.
- Removidos da navegação Web os rótulos legados Pessoal / Serviços e Missão; permanece Escalas e Férias e dispensas.
- Preservadas as três modalidades da Escala: Motorista, Patrulheiro e Permanência.
