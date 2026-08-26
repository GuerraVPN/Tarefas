TAREFAS V7.4.8 — Correção final do Controle do Site e About

1. Controle do Site
- O Admin é detectado por qualquer perfil Admin ativo vinculado ao usuário, mesmo que outro perfil esteja selecionado no momento.
- O botão SITE aparece no topo da página e também na barra mobile; há fallback flutuante quando não existe topbar.
- Ações disponíveis: EXIT USERS, Desligar site, Iniciar site, Reiniciar site e Cancelar ação pendente.
- EXIT USERS, Desligar e Reiniciar mantêm aviso global de 30 segundos antes da execução.
- Reiniciar limpa Cache API, service workers e força recarga dos recursos mantendo a sessão.
- O controle continua usando as RPCs v7_4_7_estado_site e v7_4_7_controle_site já validadas no Supabase; não exige nova migration.

2. About
- A versão atual passa a ser 7.4.8 diretamente no about.html.
- A 7.4.8 entra como primeiro item do histórico e a 7.4.7 permanece preservada como versão anterior.
- Novo patch v7_4_8_about.js reforça a versão 7.4.8 e elimina dependência do patch antigo em cache.

3. Cache / loader
- v6_2_mobile.js passa a ser carregado como 7.4.8 nas telas principais de Pessoal, Missão e About.
- O loader passa a carregar v7_4_8_site_control.js e v7_4_8_about.js.
- Demais módulos funcionais da 7.4.7 são preservados e recebem cache-buster 7.4.8.

4. Compatibilidade preservada
- Missão: horário, prontos no local/pelotão e Local opcional.
- Aditamento: GDH, passagem de serviço configurável, nomes do serviço em MAIÚSCULO e Local omitido quando vazio.
- Escala de Serviço monolítica permanece sem loader Base64/chunks.
