from pathlib import Path

p = Path('crediflow-android/app/src/main/java/br/com/guerravpn/crediflow/MainActivity.kt')
s = p.read_text()

old_call = '''            Screen.TRACK -> TrackApplicationScreen(
                onBack = { screen = Screen.WELCOME }
            )'''
new_call = '''            Screen.TRACK -> TrackApplicationScreen(
                pending = store.pendingApplication(),
                onBack = { screen = Screen.WELCOME },
                onContinueLocal = { status ->
                    screen = when (status) {
                        "correction_required" -> Screen.CORRECTION
                        "activation_sent" -> Screen.ACTIVATE
                        else -> Screen.ANALYSIS
                    }
                },
                onActivated = { s ->
                    store.saveSession(s)
                    store.clearPendingApplication()
                    session = s
                    screen = Screen.HOME
                },
                onLogin = { screen = Screen.LOGIN }
            )'''
if old_call in s:
    s = s.replace(old_call, new_call, 1)

start = s.find('@Composable\nprivate fun TrackApplicationScreen(')
end = s.find('@Composable\nprivate fun RegisterScreen(', start)
if start < 0 or end < 0:
    raise SystemExit('TrackApplicationScreen markers not found')

new_screen = r'''@Composable
private fun TrackApplicationScreen(
    pending: Triple<String, String, String>?,
    onBack: () -> Unit,
    onContinueLocal: (String) -> Unit,
    onActivated: (Session) -> Unit,
    onLogin: () -> Unit
) {
    val scope = rememberCoroutineScope()
    var email by remember { mutableStateOf("") }
    var loading by remember { mutableStateOf(false) }
    var result by remember { mutableStateOf<PublicApplicationStatus?>(null) }
    var error by remember { mutableStateOf<String?>(null) }
    var code by remember { mutableStateOf("") }
    var pass by remember { mutableStateOf("") }
    var confirm by remember { mutableStateOf("") }

    Page("Acompanhar solicitação", "Consulte e continue pelo mesmo e-mail usado no cadastro.", onBack) {
        Field("E-mail", email, KeyboardType.Email) {
            email = it.trimStart().take(254)
            result = null
            error = null
            code = ""
            pass = ""
            confirm = ""
        }

        Button(
            enabled = !loading && email.contains("@") && email.contains("."),
            onClick = {
                loading = true
                error = null
                result = null
                scope.launch {
                    try {
                        result = SupabaseApi.trackApplication(email)
                    } catch (e: Exception) {
                        error = friendly(e)
                    } finally {
                        loading = false
                    }
                }
            },
            modifier = Modifier.fillMaxWidth()
        ) {
            if (loading) {
                CircularProgressIndicator(modifier = Modifier.size(20.dp), strokeWidth = 2.dp, color = Bg)
            } else {
                Text("Consultar e continuar")
            }
        }

        result?.let { st ->
            Spacer(Modifier.height(14.dp))
            Card(modifier = Modifier.fillMaxWidth(), colors = CardDefaults.cardColors(containerColor = Panel2)) {
                Column(Modifier.fillMaxWidth().padding(18.dp)) {
                    Text(st.title, fontSize = 20.sp, fontWeight = FontWeight.Bold)
                    Spacer(Modifier.height(6.dp))
                    if (st.found && st.step > 0) {
                        Text("Etapa ${st.step} de 5", color = Blue, fontWeight = FontWeight.Bold)
                        Spacer(Modifier.height(6.dp))
                    }
                    Text(st.message, color = Muted, lineHeight = 20.sp)
                }
            }

            if (st.found) {
                when (st.status) {
                    "activation_sent" -> {
                        Section("Ativar sua conta")
                        Info("Código do Admin", "Digite o código de 6 dígitos recebido e crie sua senha para concluir o cadastro.")
                        Field("Código de 6 dígitos", code, KeyboardType.Number) {
                            code = it.filter(Char::isDigit).take(6)
                        }
                        PassField("Nova senha", pass) { pass = it }
                        PassField("Confirmar senha", confirm) { confirm = it }
                        Text("Use pelo menos 10 caracteres, com maiúscula, minúscula e número.", color = Muted, fontSize = 11.sp)
                        Button(
                            enabled = !loading && code.length == 6 && pass == confirm && pass.length >= 10,
                            onClick = {
                                loading = true
                                error = null
                                scope.launch {
                                    try {
                                        val sess = SupabaseApi.activateManual(email.trim(), code, pass)
                                        onActivated(sess)
                                    } catch (e: Exception) {
                                        error = friendly(e)
                                    } finally {
                                        loading = false
                                    }
                                }
                            },
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(if (loading) "Ativando..." else "Ativar conta e entrar")
                        }
                    }

                    "active" -> {
                        Spacer(Modifier.height(10.dp))
                        Primary("Entrar na minha conta", onLogin)
                    }

                    "rejected", "cancelled" -> Unit

                    else -> {
                        val sameLocal = pending?.third?.trim()?.equals(email.trim(), ignoreCase = true) == true
                        Spacer(Modifier.height(10.dp))
                        if (sameLocal) {
                            Primary("Continuar de onde parei") { onContinueLocal(st.status ?: "") }
                        } else {
                            Info(
                                "Solicitação localizada",
                                "O andamento foi encontrado. Para alterar documentos ou dados antes da aprovação, continue no aparelho onde o cadastro foi iniciado. Quando o Admin gerar o código, você poderá concluir a ativação aqui usando somente e-mail + código."
                            )
                        }
                    }
                }
            }
        }

        error?.let { ErrorBox(it) }
        Spacer(Modifier.height(8.dp))
        Text(
            "Esta tela permite acompanhar e retomar a solicitação sem exibir CPF, renda ou documentos.",
            color = Muted,
            fontSize = 12.sp,
            lineHeight = 17.sp
        )
    }
}

'''
s = s[:start] + new_screen + s[end:]
p.write_text(s)
print('CrediFlow v0.4 resume flow patched')
