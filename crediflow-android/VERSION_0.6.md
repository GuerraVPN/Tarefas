# CrediFlow 0.6 — Build 6

## Tema oficial
- Tema 1 — Professional
- Azul corporativo como cor principal
- Fundo navy escuro, superfícies em azul profundo e alto contraste
- Botões principais em azul vivo
- Estados de sucesso em verde, atenção em âmbar e erro em vermelho
- Mesmo padrão visual para login, cliente, solicitação de crédito e painel Admin

## Perfil do usuário
O usuário poderá alterar:
- Nome de exibição / como deseja ser chamado
- Foto de perfil
- Senha
- E-mail e telefone somente com nova verificação

Dados de identidade validados ficam bloqueados para edição direta pelo usuário, incluindo:
- CPF
- Nome civil validado
- Data de nascimento
- Outros dados usados para confirmação de identidade

Correções desses dados exigem atendimento/suporte e registro de auditoria.

## Auditoria do Admin
Registrar histórico de ações administrativas, incluindo:
- Quem realizou a alteração
- O que foi alterado
- Valor anterior e novo quando aplicável
- Data e hora
- Motivo/observação
- Aprovação/reprovação de cadastro
- Alteração de limite e condições
- Correção de dados sensíveis

## Fluxo mantido
Cadastro → Open Finance → Análise manual → Aprovação Admin → Código por e-mail → Criação de senha → Conta liberada com limite aprovado.
