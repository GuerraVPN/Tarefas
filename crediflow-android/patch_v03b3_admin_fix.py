from pathlib import Path

p = Path('crediflow-android/app/src/main/java/br/com/guerravpn/crediflow/MainActivity.kt')
s = p.read_text(encoding='utf-8')

def rep(old, new, label):
    global s
    if old not in s:
        raise SystemExit(f'pattern not found: {label}')
    s = s.replace(old, new, 1)

rep('Text("CREDIFLOW · v0.2 build 2", fontSize = 11.sp, color = Muted, fontWeight = FontWeight.Bold)',
    'Text("CREDIFLOW · v0.3 build 3", fontSize = 11.sp, color = Muted, fontWeight = FontWeight.Bold)',
    'version label')

rep('    var notes by remember { mutableStateOf("") }\n\n    val correctionOptions = linkedMapOf(',
    '    var notes by remember { mutableStateOf("") }\n    var activationResult by remember { mutableStateOf<ActivationCodeResult?>(null) }\n\n    val correctionOptions = linkedMapOf(',
    'activation state')

rep('''                detail = SupabaseApi.adminDetail(token, app.id)\n                error = null''',
'''                val loaded = SupabaseApi.adminDetail(token, app.id)\n                detail = loaded\n                val current = loaded.application\n                limit = current.approvedLimit?.let { String.format(Locale("pt", "BR"), "%.2f", it) } ?: ""\n                rate = current.approvedMonthlyRate?.let { String.format(Locale("pt", "BR"), "%.2f", it * 100.0) } ?: ""\n                maxInstallments = current.approvedMaxInstallments?.toString() ?: "1"\n                tier = current.approvedRiskTier?.takeIf { it.isNotBlank() } ?: "A"\n                error = null''',
    'admin preload')

rep('''    fun openEmail(mail: CorrectionMail) {\n        val intent = Intent(Intent.ACTION_SENDTO).apply {\n            data = Uri.parse("mailto:${mail.recipient}")\n            putExtra(Intent.EXTRA_SUBJECT, mail.subject)\n            putExtra(Intent.EXTRA_TEXT, mail.body)\n        }\n        try {\n            context.startActivity(intent)\n        } catch (_: Exception) {\n            error = "Nenhum aplicativo de e-mail encontrado."\n        }\n    }''',
'''    fun openEmail(mail: CorrectionMail) {\n        val mailto = "mailto:${Uri.encode(mail.recipient)}?subject=${Uri.encode(mail.subject)}&body=${Uri.encode(mail.body)}"\n        val intent = Intent(Intent.ACTION_SENDTO, Uri.parse(mailto))\n        try {\n            context.startActivity(intent)\n        } catch (_: Exception) {\n            error = "Nenhum aplicativo de e-mail encontrado."\n        }\n    }''',
    'email composer')

rep('''                            val mail = CorrectionMail(\n                                result.email,\n                                "CrediFlow — código de acesso",\n                                "Seu cadastro CrediFlow foi aprovado.\\n\\nCódigo de acesso: ${result.code}\\n\\nO código expira em 15 minutos. Abra o aplicativo, toque em “Acompanhar minha análise” e crie sua senha."\n                            )\n                            openEmail(mail)''',
'''                            activationResult = result\n                            val mail = CorrectionMail(\n                                result.email,\n                                "CrediFlow — código de acesso",\n                                "Olá! Seu cadastro CrediFlow foi aprovado.\\n\\nCódigo de acesso: ${result.code}\\n\\nEste código expira em 15 minutos. Abra o CrediFlow, toque em “Acompanhar minha análise”, informe o código e crie sua senha.\\n\\nSe você não solicitou este cadastro, ignore esta mensagem."\n                            )\n                            openEmail(mail)''',
    'activation result assignment')

needle = '''            ) {\n                Text("Gerar código e preparar e-mail")\n            }\n        }\n\n        error?.let { ErrorBox(it) }'''
replacement = '''            ) {\n                Text("Gerar código e preparar e-mail")\n            }\n\n            activationResult?.let { generated ->\n                Success(\n                    "Código gerado: ${generated.code}",\n                    "Envie este código para ${generated.email}. Ele expira em 15 minutos. Se o e-mail não preencher sozinho, toque no botão abaixo para abrir novamente."\n                )\n                OutlinedButton(\n                    onClick = {\n                        openEmail(\n                            CorrectionMail(\n                                generated.email,\n                                "CrediFlow — código de acesso",\n                                "Olá! Seu cadastro CrediFlow foi aprovado.\\n\\nCódigo de acesso: ${generated.code}\\n\\nEste código expira em 15 minutos. Abra o CrediFlow, toque em “Acompanhar minha análise”, informe o código e crie sua senha.\\n\\nSe você não solicitou este cadastro, ignore esta mensagem."\n                            )\n                        )\n                    },\n                    modifier = Modifier.fillMaxWidth()\n                ) {\n                    Text("Abrir e-mail preenchido novamente")\n                }\n            }\n        }\n\n        error?.let { ErrorBox(it) }'''
rep(needle, replacement, 'activation visible result')

p.write_text(s, encoding='utf-8')
print('patched MainActivity.kt for v0.3 build 3')
