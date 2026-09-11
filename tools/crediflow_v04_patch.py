from pathlib import Path


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if new in text:
        return text
    if old not in text:
        raise SystemExit(f"marker not found: {label}")
    return text.replace(old, new, 1)


gradle = Path("crediflow-android/app/build.gradle.kts")
g = gradle.read_text()
g = g.replace("versionCode = 3", "versionCode = 4")
g = g.replace('versionName = "0.3"', 'versionName = "0.4"')
gradle.write_text(g)

api = Path("crediflow-android/app/src/main/java/br/com/guerravpn/crediflow/Api.kt")
a = api.read_text()

marker = '''data class ApplicationStatus(
    val status: String,
    val approvedLimit: Double?,
    val activationReady: Boolean,
    val correctionFields: List<String>,
    val correctionNote: String?,
    val verificationScore: Int?,
    val verificationLevel: String?,
    val documentStatus: Map<String, String>
)
'''
addition = marker + '''
data class PublicApplicationStatus(
    val found: Boolean,
    val status: String?,
    val step: Int,
    val title: String,
    val message: String,
    val updatedAt: String?
)
'''
if "data class PublicApplicationStatus(" not in a:
    if marker not in a:
        raise SystemExit("ApplicationStatus marker not found")
    a = a.replace(marker, addition, 1)

check_marker = '''    suspend fun uploadApplicationDocument(
'''
track_method = '''    suspend fun trackApplication(email: String): PublicApplicationStatus {
        val r = JSONObject(
            request(
                "POST",
                "/functions/v1/public-application-status",
                JSONObject().put("email", email.trim().lowercase())
            )
        )
        return PublicApplicationStatus(
            found = r.optBoolean("found", false),
            status = if (r.isNull("status")) null else r.optString("status"),
            step = r.optInt("step", 0),
            title = r.optString("title", "Acompanhamento"),
            message = r.optString("message", "Não foi possível obter o andamento."),
            updatedAt = if (r.isNull("updatedAt")) null else r.optString("updatedAt")
        )
    }

'''
if "suspend fun trackApplication(" not in a:
    if check_marker not in a:
        raise SystemExit("uploadApplicationDocument marker not found")
    a = a.replace(check_marker, track_method + check_marker, 1)
api.write_text(a)

main = Path("crediflow-android/app/src/main/java/br/com/guerravpn/crediflow/MainActivity.kt")
m = main.read_text()
m = m.replace("CREDIFLOW · v0.3 build 3", "CREDIFLOW · v0.4 build 4")
m = m.replace("CrediFlow · v0.3 build 3", "CrediFlow · v0.4 build 4")

m = replace_once(
    m,
    '''private enum class Screen {
    WELCOME, REGISTER, DOCUMENTS, ANALYSIS, CORRECTION, ACTIVATE, LOGIN, HOME, LOAN_REQUEST, ADMIN, ADMIN_DETAIL
}''',
    '''private enum class Screen {
    WELCOME, TRACK, REGISTER, DOCUMENTS, ANALYSIS, CORRECTION, ACTIVATE, LOGIN, HOME, LOAN_REQUEST, ADMIN, ADMIN_DETAIL
}''',
    "screen enum",
)

m = replace_once(
    m,
    '''            Screen.WELCOME -> WelcomeScreen(
                hasAnalysis = store.pendingApplication() != null,
                onRegister = { screen = Screen.REGISTER },
                onLogin = { screen = Screen.LOGIN },
                onAnalysis = { screen = Screen.ANALYSIS }
            )

            Screen.REGISTER -> RegisterScreen(''',
    '''            Screen.WELCOME -> WelcomeScreen(
                hasAnalysis = store.pendingApplication() != null,
                onRegister = { screen = Screen.REGISTER },
                onLogin = { screen = Screen.LOGIN },
                onTrack = { screen = Screen.TRACK },
                onAnalysis = { screen = Screen.ANALYSIS }
            )

            Screen.TRACK -> TrackApplicationScreen(
                onBack = { screen = Screen.WELCOME }
            )

            Screen.REGISTER -> RegisterScreen(''',
    "welcome route",
)

m = replace_once(
    m,
    '''private fun WelcomeScreen(
    hasAnalysis: Boolean,
    onRegister: () -> Unit,
    onLogin: () -> Unit,
    onAnalysis: () -> Unit
) {''',
    '''private fun WelcomeScreen(
    hasAnalysis: Boolean,
    onRegister: () -> Unit,
    onLogin: () -> Unit,
    onTrack: () -> Unit,
    onAnalysis: () -> Unit
) {''',
    "welcome signature",
)

m = replace_once(
    m,
    '''        Primary("Criar cadastro", onRegister)
        Spacer(Modifier.height(10.dp))
        Secondary("Entrar na minha conta", onLogin)

        if (hasAnalysis) {
            TextButton(onClick = onAnalysis, modifier = Modifier.fillMaxWidth()) {
                Text("Acompanhar minha análise")
            }
        }
''',
    '''        Primary("Criar cadastro", onRegister)
        Spacer(Modifier.height(10.dp))
        Secondary("Entrar na minha conta", onLogin)
        Spacer(Modifier.height(10.dp))
        Secondary("Acompanhar solicitação", onTrack)

        if (hasAnalysis) {
            TextButton(onClick = onAnalysis, modifier = Modifier.fillMaxWidth()) {
                Text("Continuar solicitação neste aparelho")
            }
        }
''',
    "welcome buttons",
)

register_marker = '''@Composable
private fun RegisterScreen(onBack: () -> Unit, onCreated: (String, String, String) -> Unit) {'''
track_screen = r'''@Composable
private fun TrackApplicationScreen(onBack: () -> Unit) {
    val scope = rememberCoroutineScope()
    var email by remember { mutableStateOf("") }
    var loading by remember { mutableStateOf(false) }
    var result by remember { mutableStateOf<PublicApplicationStatus?>(null) }
    var error by remember { mutableStateOf<String?>(null) }

    Page("Acompanhar solicitação", "Consulte pelo mesmo e-mail usado no cadastro.", onBack) {
        Field("E-mail", email, KeyboardType.Email) {
            email = it.trimStart().take(254)
            result = null
            error = null
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
                CircularProgressIndicator(
                    modifier = Modifier.size(20.dp),
                    strokeWidth = 2.dp,
                    color = Bg
                )
            } else {
                Text("Consultar andamento")
            }
        }

        result?.let { s ->
            Spacer(Modifier.height(14.dp))
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Panel2)
            ) {
                Column(Modifier.fillMaxWidth().padding(18.dp)) {
                    Text(s.title, fontSize = 20.sp, fontWeight = FontWeight.Bold)
                    Spacer(Modifier.height(6.dp))
                    if (s.found && s.step > 0) {
                        Text("Etapa ${s.step} de 5", color = Blue, fontWeight = FontWeight.Bold)
                        Spacer(Modifier.height(6.dp))
                    }
                    Text(s.message, color = Muted, lineHeight = 20.sp)
                    if (!s.updatedAt.isNullOrBlank()) {
                        Spacer(Modifier.height(8.dp))
                        Text("Última atualização registrada no sistema.", color = Muted, fontSize = 12.sp)
                    }
                }
            }
        }

        error?.let { ErrorBox(it) }
        Spacer(Modifier.height(8.dp))
        Text(
            "Por segurança, esta consulta mostra somente o andamento geral. Dados pessoais, documentos, renda e limite não aparecem aqui.",
            color = Muted,
            fontSize = 12.sp,
            lineHeight = 17.sp
        )
    }
}

'''
if "private fun TrackApplicationScreen(" not in m:
    if register_marker not in m:
        raise SystemExit("Register marker not found")
    m = m.replace(register_marker, track_screen + register_marker, 1)

main.write_text(m)
print("CrediFlow v0.4 build 4 patch applied")
