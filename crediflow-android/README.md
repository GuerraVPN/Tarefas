# CrediFlow Android — v0.1 build 1

Aplicativo Android nativo em Kotlin + Jetpack Compose conectado ao projeto Supabase `xvhbydoslqmnjjsnyvus`.

Fluxo implementado: cadastro completo → etapa Open Finance → Análise → aprovação manual no Admin → código OTP por e-mail → criação da senha → conta com limite aprovado.

O aplicativo não automatiza a decisão de crédito: limite, taxa e número máximo de parcelas são informados manualmente pelo administrador.

A liberação real por Pix, Pix Automático e Open Finance ficam bloqueadas até a configuração de um parceiro financeiro/BaaS/Open Finance autorizado. A build não finge transferências reais.

Assinatura release preparada para o mesmo certificado do Tarefas: alias `alias`, SHA-256 `B0:22:A5:42:DD:8E:D9:5F:8F:7C:C5:DA:3F:EF:CC:5A:1B:5E:2A:A1:58:ED:E0:14:2C:71:09:FB:F7:4A:43:B5`. O keystore e senhas nunca são commitados.

Para OTP real para clientes externos, configure SMTP customizado no Supabase Auth. O endereço temporário informado para remetente é `noreplycrediflow@gmail.com`.
