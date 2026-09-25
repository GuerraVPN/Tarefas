TAREFAS Web 7.9.3

Foco da versão
- Reorganizar o menu lateral de Pessoal para a estrutura usada no app.
- Remover da navegação os acessos "Escala de serviço" e "Escala de missão".
- Adicionar "Escala" como submenu com três planilhas oficiais do Google Sheets.
- Manter "Férias / Dispensas" e "Usuários" logo abaixo da Escala.
- Abrir Motorista, Patrulheiro e Permanência em nova aba do navegador.
- Atualizar a identificação visual da Web para 7.9.3.

Menu final
Pessoal
  Escala
    Motorista
    Patrulheiro
    Permanência
  Férias / Dispensas
  Usuários

Planilhas
- Motorista: Google Sheets oficial já usado pelo TAREFAS.
- Patrulheiro: Google Sheets oficial já usado pelo TAREFAS.
- Permanência: Google Sheets oficial já usado pelo TAREFAS.

Implementação
- Novo módulo: v7_9_3_nav.js.
- Novo controlador de versão: v7_9_3_version.js.
- v6_2_mobile.js carrega os módulos 7.9.3 após a cadeia existente.
- A navegação continua compatível com desktop e mobile.
- Usuários e Férias / Dispensas permanecem na navegação.
- As páginas legadas pessoal.html e missao.html não foram excluídas; apenas deixaram de ser expostas no menu lateral.

Validação
- scripts/verify-web.mjs passa a verificar a presença do módulo 7.9.3, dos três IDs das planilhas e a ausência dos rótulos legados no novo módulo.
