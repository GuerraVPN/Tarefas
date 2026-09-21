TAREFAS Web 7.9.0

Objetivo
- Aproximar o site das funções consolidadas no Android 2.3.25.
- Criar uma nova base Web para a futura linha 2.4 do aplicativo.
- Reduzir polling e observadores agressivos herdados de versões antigas.

Principais mudanças
- Central de Notificações 2.0 no navegador.
- Abas Central: Notificações, Mensagens, Downloads, Favoritos e Ferramentas.
- Notificações com seleção múltipla, marcar lidas, excluir selecionadas, filtros, retenção 30/60/90 dias, pin e silenciamento.
- Favoritos para páginas, módulos e subabas internas.
- Filtros salvos com captura de campos, subaba, rota e escopo; abrir, renomear, substituir e excluir.
- Filtro de status em Quadro e Minhas Tarefas, combinável com busca e seção.
- Central de Erros Web.
- Fila Web sequencial para ações da Central durante oscilação de conexão.
- Token de ciclo de tela para evitar aplicar respostas assíncronas obsoletas.
- Helper global seguro para DOM.
- Assistente IA Web 7.9.0 com contexto reduzido para 6 mensagens recentes e indicador de tempo.
- Rastreamento local de downloads iniciados por links do TAREFAS.
- Removido polling global de versão a cada 5 segundos.
- Removido polling legado de 2,5 segundos do patch 7.5.4.
- MutationObservers passam a observar somente mudanças estruturais necessárias.

Compatibilidade
- Mantém os módulos e correções legadas que ainda têm função real.
- A 7.9.0 passa a concentrar as novas funções em v7_9_0_web.js.
- Não introduz PWA/Service Worker nesta versão para evitar risco adicional antes da estabilização.
