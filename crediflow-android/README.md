# CrediFlow Android — v0.7

Aplicativo Android nativo em Kotlin + Jetpack Compose conectado ao projeto Supabase `xvhbydoslqmnjjsnyvus`.

## Fluxo principal

Cadastro completo → Open Finance → Análise → aprovação manual no Admin → código OTP por e-mail → criação da senha → conta com limite aprovado.

A decisão de crédito continua manual: limite, taxa e número máximo de parcelas são informados pelo administrador. O aplicativo não calcula sozinho quem deve receber crédito.

## Correções e novidades da 0.7

- Novo package/applicationId: `br.com.guerravpn.crediflow.app`, separado das builds antigas para evitar conflito de instalação.
- Versão do Android exibida somente como **0.7**, sem `-debug` e sem `build` no `versionName`.
- Ícone do CrediFlow configurado como launcher icon adaptativo e round icon.
- Botão **Acompanhar solicitação** restaurado na tela inicial e mantido visível.
- Tema oficial **Professional** mantido.
- Área **Perfil e segurança** mantida com nome de exibição, foto de perfil e alteração de senha.
- Campos de identidade permanecem bloqueados para edição direta.
- Histórico de auditoria do Admin mantido.
- A solicitação de empréstimo continua limitada ao valor já aprovado e não simula uma transferência real.

## Integrações ainda pendentes

A liberação real por Pix, Pix Automático e o Open Finance bancário permanecem bloqueados até a configuração de um parceiro financeiro/BaaS/Open Finance autorizado. A build não finge transferências reais.

Para OTP real para clientes externos, configure SMTP customizado no Supabase Auth. O endereço temporário informado para remetente é `noreplycrediflow@gmail.com`.

## Assinatura

A configuração release está preparada para usar o mesmo certificado do Tarefas: alias `alias`, SHA-256 `B0:22:A5:42:DD:8E:D9:5F:8F:7C:C5:DA:3F:EF:CC:5A:1B:5E:2A:A1:58:ED:E0:14:2C:71:09:FB:F7:4A:43:B5`. O keystore e as senhas nunca são commitados.

A APK gerada automaticamente pelo workflow atual é de teste da versão 0.7.
