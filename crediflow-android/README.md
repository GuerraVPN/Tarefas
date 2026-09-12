# CrediFlow Android — v0.6 build 6

Aplicativo Android nativo em Kotlin + Jetpack Compose conectado ao projeto Supabase `xvhbydoslqmnjjsnyvus`.

## Fluxo principal

Cadastro completo → Open Finance → Análise → aprovação manual no Admin → código OTP por e-mail → criação da senha → conta com limite aprovado.

A decisão de crédito continua manual: limite, taxa e número máximo de parcelas são informados pelo administrador. O aplicativo não calcula sozinho quem deve receber crédito.

## Novidades da 0.6

- Tema oficial **Professional**, em azul corporativo, aplicado à nova Activity da 0.6.
- Nova área **Perfil e segurança**.
- Cliente pode alterar o **nome de exibição** (como quer ser chamado).
- Cliente pode trocar a **foto de perfil**; imagens ficam no bucket `profile-avatars`, limitadas a 5 MB e JPEG/PNG/WebP.
- Cliente pode alterar a **senha** usando o Supabase Auth.
- Campos de identidade ficam bloqueados para edição direta: nome civil e CPF, além dos dados verificados exibidos na tela.
- O banco só concede UPDATE ao cliente nas colunas `display_name` e `avatar_path`; não é apenas um bloqueio visual.
- Alterações de nome/foto geram registros em `audit_log`.
- Alteração de senha registra evento de segurança sem armazenar a senha.
- Painel Admin ganhou a tela **Histórico de auditoria**, com usuário, ação e data/hora.
- A solicitação de empréstimo continua limitada ao valor já aprovado e não simula uma transferência real.

## Integrações ainda pendentes

A liberação real por Pix, Pix Automático e o Open Finance bancário permanecem bloqueados até a configuração de um parceiro financeiro/BaaS/Open Finance autorizado. A build não finge transferências reais.

Para OTP real para clientes externos, configure SMTP customizado no Supabase Auth. O endereço temporário informado para remetente é `noreplycrediflow@gmail.com`.

## Assinatura

A configuração release está preparada para usar o mesmo certificado do Tarefas: alias `alias`, SHA-256 `B0:22:A5:42:DD:8E:D9:5F:8F:7C:C5:DA:3F:EF:CC:5A:1B:5E:2A:A1:58:ED:E0:14:2C:71:09:FB:F7:4A:43:B5`. O keystore e as senhas nunca são commitados.

A APK gerada automaticamente pelo workflow atual é **debug**, destinada a testes da 0.6.
