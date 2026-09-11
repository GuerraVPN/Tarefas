package br.com.guerravpn.crediflow

import android.app.DatePickerDialog
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.launch
import org.json.JSONObject
import java.text.NumberFormat
import java.time.LocalDate
import java.time.ZoneId
import java.util.Locale

private val Bg = Color(0xFF07101E)
private val Panel = Color(0xFF0E1A2D)
private val Panel2 = Color(0xFF13233B)
private val Blue = Color(0xFF61A8FF)
private val Mint = Color(0xFF5CE0B8)
private val Muted = Color(0xFF93A7C3)
private val Danger = Color(0xFFFF6B7B)
private val Warning = Color(0xFFFFCC66)

private enum class Screen {
    WELCOME, TRACK, REGISTER, DOCUMENTS, ANALYSIS, CORRECTION, ACTIVATE, LOGIN, HOME, LOAN_REQUEST, ADMIN, ADMIN_DETAIL
}

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme(
                colorScheme = darkColorScheme(
                    primary = Blue,
                    secondary = Mint,
                    background = Bg,
                    surface = Panel,
                    surfaceVariant = Panel2,
                    onPrimary = Bg,
                    onBackground = Color(0xFFF0F6FF),
                    onSurface = Color(0xFFF0F6FF)
                )
            ) {
                CrediFlowApp()
            }
        }
    }
}

@Composable
private fun CrediFlowApp() {
    val context = LocalContext.current
    val store = remember { SessionStore(context) }
    var session by remember { mutableStateOf(store.session()) }
    var selected by remember { mutableStateOf<AdminApplication?>(null) }

    var screen by remember {
        mutableStateOf(
            when {
                session?.role == "admin" -> Screen.ADMIN
                session != null && session?.activationRequired == false -> Screen.HOME
                store.pendingApplication() != null -> Screen.ANALYSIS
                else -> Screen.WELCOME
            }
        )
    }

    Surface(Modifier.fillMaxSize(), color = Bg) {
        when (screen) {
            Screen.WELCOME -> WelcomeScreen(
                hasAnalysis = store.pendingApplication() != null,
                onRegister = { screen = Screen.REGISTER },
                onLogin = { screen = Screen.LOGIN },
                onTrack = { screen = Screen.TRACK },
                onAnalysis = { screen = Screen.ANALYSIS }
            )

            Screen.TRACK -> TrackApplicationScreen(
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
            )

            Screen.REGISTER -> RegisterScreen(
                onBack = { screen = Screen.WELCOME },
                onCreated = { id, secret, email ->
                    store.savePendingApplication(id, secret, email)
                    screen = Screen.DOCUMENTS
                }
            )

            Screen.DOCUMENTS -> DocumentUploadScreen(
                pending = store.pendingApplication(),
                onBack = { screen = Screen.ANALYSIS },
                onContinue = { screen = Screen.ANALYSIS }
            )

            Screen.ANALYSIS -> AnalysisScreen(
                pending = store.pendingApplication(),
                onBack = { screen = Screen.WELCOME },
                onDocuments = { screen = Screen.DOCUMENTS },
                onCorrection = { screen = Screen.CORRECTION },
                onActivation = { screen = Screen.ACTIVATE }
            )

            Screen.CORRECTION -> CorrectionScreen(
                pending = store.pendingApplication(),
                onBack = { screen = Screen.ANALYSIS },
                onDone = { screen = Screen.ANALYSIS }
            )

            Screen.ACTIVATE -> ManualActivationScreen(
                email = store.pendingApplication()?.third ?: "",
                onBack = { screen = Screen.ANALYSIS },
                onActivated = { s ->
                    store.saveSession(s)
                    store.clearPendingApplication()
                    session = s
                    screen = Screen.HOME
                }
            )

            Screen.LOGIN -> LoginScreen(
                onBack = { screen = Screen.WELCOME },
                onLogin = { s ->
                    store.saveSession(s)
                    session = s
                    screen = if (s.role == "admin") Screen.ADMIN else Screen.HOME
                }
            )

            Screen.HOME -> HomeScreen(
                session = session,
                onLoan = { screen = Screen.LOAN_REQUEST },
                onLogout = {
                    store.clearSession()
                    session = null
                    screen = Screen.WELCOME
                }
            )

            Screen.LOAN_REQUEST -> LoanRequestScreen(
                session = session,
                onBack = { screen = Screen.HOME },
                onSubmitted = { screen = Screen.HOME }
            )

            Screen.ADMIN -> AdminScreen(
                session = session,
                onOpen = {
                    selected = it
                    screen = Screen.ADMIN_DETAIL
                },
                onLogout = {
                    store.clearSession()
                    session = null
                    screen = Screen.WELCOME
                }
            )

            Screen.ADMIN_DETAIL -> AdminDetailScreen(
                session = session,
                application = selected,
                onBack = { screen = Screen.ADMIN },
                onChanged = { screen = Screen.ADMIN }
            )
        }
    }
}

@Composable
private fun WelcomeScreen(
    hasAnalysis: Boolean,
    onRegister: () -> Unit,
    onLogin: () -> Unit,
    onTrack: () -> Unit,
    onAnalysis: () -> Unit
) {
    Column(
        Modifier.fillMaxSize().padding(22.dp),
        verticalArrangement = Arrangement.Center
    ) {
        Box(
            Modifier.size(68.dp).background(Blue, RoundedCornerShape(20.dp)),
            contentAlignment = Alignment.Center
        ) {
            Text("C", color = Bg, fontSize = 34.sp, fontWeight = FontWeight.Black)
        }

        Spacer(Modifier.height(24.dp))
        Text("CREDIFLOW · v0.5 build 5", fontSize = 11.sp, color = Muted, fontWeight = FontWeight.Bold)
        Text("Crédito com clareza do início ao fim.", fontSize = 34.sp, lineHeight = 38.sp, fontWeight = FontWeight.Black)
        Spacer(Modifier.height(28.dp))

        Primary("Criar cadastro", onRegister)
        Spacer(Modifier.height(10.dp))
        Secondary("Entrar na minha conta", onLogin)
        Spacer(Modifier.height(10.dp))
        Secondary("Acompanhar solicitação", onTrack)

        if (hasAnalysis) {
            TextButton(onClick = onAnalysis, modifier = Modifier.fillMaxWidth()) {
                Text("Continuar solicitação neste aparelho")
            }
        }

        Spacer(Modifier.height(16.dp))
        Text(
            "Fluxo atual: cadastro + documentos + análise manual. Open Finance está desativado por enquanto.",
            color = Muted,
            fontSize = 12.sp,
            lineHeight = 17.sp
        )
    }
}

@Composable
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

@Composable
private fun RegisterScreen(onBack: () -> Unit, onCreated: (String, String, String) -> Unit) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    var loading by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }

    var name by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var cpf by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var birth by remember { mutableStateOf("") }
    var street by remember { mutableStateOf("") }
    var number by remember { mutableStateOf("") }
    var complement by remember { mutableStateOf("") }
    var neighborhood by remember { mutableStateOf("") }
    var city by remember { mutableStateOf("") }
    var state by remember { mutableStateOf("RS") }
    var cep by remember { mutableStateOf("") }
    var occupation by remember { mutableStateOf("") }
    var income by remember { mutableStateOf("") }
    var consent by remember { mutableStateOf(false) }

    fun pickBirthDate() {
        val today = LocalDate.now()
        DatePickerDialog(
            context,
            { _, year, month, day ->
                birth = "%04d-%02d-%02d".format(year, month + 1, day)
            },
            today.year - 18,
            today.monthValue - 1,
            today.dayOfMonth
        ).apply {
            datePicker.maxDate = today.minusYears(18)
                .atStartOfDay(ZoneId.systemDefault()).toInstant().toEpochMilli()
        }.show()
    }

    var cepLookupRunning by remember { mutableStateOf(false) }
    LaunchedEffect(cep.filter(Char::isDigit)) {
        val digits = cep.filter(Char::isDigit)
        if (digits.length == 8) {
            cepLookupRunning = true
            try {
                val address = SupabaseApi.lookupCep(digits)
                if (address != null) {
                    if (address.street.isNotBlank()) street = address.street
                    if (address.neighborhood.isNotBlank()) neighborhood = address.neighborhood
                    if (address.city.isNotBlank()) city = address.city
                    if (address.state.isNotBlank()) state = address.state
                    if (complement.isBlank() && address.complement.isNotBlank()) complement = address.complement
                    if (error == "CEP não encontrado." || error == "Não foi possível consultar o CEP agora.") error = null
                } else {
                    error = "CEP não encontrado. Confira o número ou preencha o endereço manualmente."
                }
            } catch (_: Exception) {
                error = "Não foi possível consultar o CEP agora. Você pode preencher o endereço manualmente."
            } finally {
                cepLookupRunning = false
            }
        }
    }

    Page("Seu cadastro", "Preencha os dados para iniciar a análise.", onBack) {
        Info(
            "Fluxo",
            "Cadastro → identidade frente/verso + contracheque → análise manual → aprovação → código manual → senha."
        )

        Field("Nome completo", name) { name = it }
        Field("E-mail", email, KeyboardType.Email) { email = it }
        Field("CPF", cpf, KeyboardType.Number) { cpf = formatCpfInput(it) }
        Field("Celular", phone, KeyboardType.Phone) { phone = formatPhoneInput(it) }

        Text("Data de nascimento", color = Muted, fontSize = 12.sp)
        OutlinedButton(onClick = { pickBirthDate() }, modifier = Modifier.fillMaxWidth()) {
            Text(if (birth.isBlank()) "Selecionar data" else displayDate(birth))
        }

        Section("Endereço")
        Field("CEP", cep, KeyboardType.Number) { cep = formatCepInput(it) }
        if (cepLookupRunning) Text("Buscando endereço pelo CEP...", color = Muted, fontSize = 11.sp)
        Field("Rua / avenida", street) { street = it }
        Field("Número", number) { number = it }
        Field("Complemento", complement) { complement = it }
        Field("Bairro", neighborhood) { neighborhood = it }
        Field("Cidade", city) { city = it }
        Field("UF", state) { state = it.uppercase().take(2) }

        Section("Dados para análise")
        Field("Profissão / ocupação", occupation) { occupation = it }
        MoneyField("Renda mensal aproximada", income) { income = it }

        Row(verticalAlignment = Alignment.CenterVertically) {
            Checkbox(consent, { consent = it })
            Text(
                "Confirmo que os dados são verdadeiros e concordo com o uso deles para cadastro, segurança e análise.",
                fontSize = 12.sp,
                color = Muted
            )
        }

        error?.let { ErrorBox(it) }

        Button(
            enabled = !loading && consent,
            onClick = {
                if (listOf(name, email, cpf, phone, birth, street, number, neighborhood, city, state, cep).any { it.isBlank() }) {
                    error = "Preencha os campos obrigatórios."
                } else if (!isValidCpf(cpf)) {
                    error = "CPF inválido. Confira os números informados."
                } else if (phone.filter(Char::isDigit).length !in 10..11) {
                    error = "Informe um telefone com DDD."
                } else if (cep.filter(Char::isDigit).length != 8) {
                    error = "Informe um CEP válido."
                } else {
                    val inc = moneyToDouble(income)
                    if (inc == null || inc < 0) {
                        error = "Informe uma renda válida."
                    } else {
                        loading = true
                        error = null
                        scope.launch {
                            try {
                                val r = SupabaseApi.submitApplication(
                                    name.trim(),
                                    email.trim(),
                                    cpf,
                                    phone,
                                    birth,
                                    street.trim(),
                                    number.trim(),
                                    complement.trim(),
                                    neighborhood.trim(),
                                    city.trim(),
                                    state.trim(),
                                    cep,
                                    occupation.trim(),
                                    inc
                                )
                                onCreated(r.first, r.second, email.trim())
                            } catch (e: Exception) {
                                error = friendly(e)
                            } finally {
                                loading = false
                            }
                        }
                    }
                }
            },
            modifier = Modifier.fillMaxWidth().height(52.dp)
        ) {
            Text(if (loading) "Enviando..." else "Continuar para documentos")
        }
    }
}

@Composable
private fun DocumentUploadScreen(
    pending: Triple<String, String, String>?,
    onBack: () -> Unit,
    onContinue: () -> Unit
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var status by remember { mutableStateOf<ApplicationStatus?>(null) }
    var pickingKind by remember { mutableStateOf<String?>(null) }
    var loading by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }

    fun refresh() {
        val p = pending ?: return
        scope.launch {
            try {
                status = SupabaseApi.checkApplication(p.first, p.second)
            } catch (e: Exception) {
                error = friendly(e)
            }
        }
    }

    val launcher = rememberLauncherForActivityResult(ActivityResultContracts.OpenDocument()) { uri ->
        val kind = pickingKind
        val p = pending
        if (uri != null && kind != null && p != null) {
            loading = true
            scope.launch {
                try {
                    val mime = context.contentResolver.getType(uri) ?: if (kind == "payslip") "application/pdf" else "image/jpeg"
                    val bytes = context.contentResolver.openInputStream(uri)?.use { it.readBytes() }
                        ?: throw IllegalStateException("Não foi possível ler o arquivo.")
                    status = SupabaseApi.uploadApplicationDocument(p.first, p.second, kind, mime, bytes)
                    error = null
                } catch (e: Exception) {
                    error = friendly(e)
                } finally {
                    loading = false
                    pickingKind = null
                }
            }
        }
    }

    LaunchedEffect(pending?.first) { refresh() }

    Page("Documentos", pending?.third ?: "Cadastro", onBack) {
        if (pending == null) {
            ErrorBox("Não há cadastro salvo neste aparelho.")
            return@Page
        }

        Info(
            "Obrigatórios para análise",
            "Envie a identidade frente e verso e um contracheque recente. O contracheque pode ser PDF ou imagem."
        )

        DocumentRow(
            "Identidade — frente",
            status?.documentStatus?.get("identity_front"),
            loading
        ) {
            pickingKind = "identity_front"
            launcher.launch(arrayOf("image/*"))
        }

        DocumentRow(
            "Identidade — verso",
            status?.documentStatus?.get("identity_back"),
            loading
        ) {
            pickingKind = "identity_back"
            launcher.launch(arrayOf("image/*"))
        }

        DocumentRow(
            "Contracheque",
            status?.documentStatus?.get("payslip"),
            loading
        ) {
            pickingKind = "payslip"
            launcher.launch(arrayOf("application/pdf", "image/*"))
        }

        status?.verificationScore?.let {
            Info("Verificação cadastral", "$it/100 · ${verificationLabel(status?.verificationLevel)}")
        }

        error?.let { ErrorBox(it) }

        val complete = listOf("identity_front", "identity_back", "payslip")
            .all { status?.documentStatus?.get(it) in setOf("uploaded", "verified") }

        Button(
            enabled = complete && !loading,
            onClick = onContinue,
            modifier = Modifier.fillMaxWidth()
        ) {
            Text(if (complete) "Enviar para análise" else "Envie os 3 documentos")
        }
    }
}

@Composable
private fun AnalysisScreen(
    pending: Triple<String, String, String>?,
    onBack: () -> Unit,
    onDocuments: () -> Unit,
    onCorrection: () -> Unit,
    onActivation: () -> Unit
) {
    val scope = rememberCoroutineScope()
    var st by remember { mutableStateOf<ApplicationStatus?>(null) }
    var loading by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }

    fun refresh() {
        val p = pending ?: return
        loading = true
        scope.launch {
            try {
                st = SupabaseApi.checkApplication(p.first, p.second)
                error = null
            } catch (e: Exception) {
                error = friendly(e)
            } finally {
                loading = false
            }
        }
    }

    LaunchedEffect(pending?.first) { refresh() }

    Page("Análise", pending?.third ?: "Sua solicitação", onBack) {
        if (pending == null) {
            ErrorBox("Não há solicitação salva neste aparelho.")
            return@Page
        }

        val docsReady = listOf("identity_front", "identity_back", "payslip")
            .all { st?.documentStatus?.get(it) in setOf("uploaded", "verified") }

        Step("1", "Cadastro", "Concluído", Mint)
        Step("2", "Documentos", if (docsReady) "Enviados" else "Pendentes", if (docsReady) Mint else Warning)
        Step(
            "3",
            "Análise manual",
            when (st?.status) {
                "approved", "activation_sent", "active" -> "Aprovado"
                "correction_required" -> "Atualização necessária"
                "rejected" -> "Não aprovado"
                else -> "Em análise"
            },
            when (st?.status) {
                "approved", "activation_sent", "active" -> Mint
                "rejected" -> Danger
                "correction_required" -> Warning
                else -> Blue
            }
        )
        Step(
            "4",
            "Ativação",
            when (st?.status) {
                "activation_sent" -> "Código gerado"
                "active" -> "Ativa"
                else -> "Pendente"
            },
            if (st?.status == "active") Mint else Muted
        )

        st?.verificationScore?.let {
            Info("Pontuação de verificação", "$it/100 · ${verificationLabel(st?.verificationLevel)}")
        }

        when (st?.status) {
            "correction_required" -> {
                ErrorBox("O analista solicitou atualização de alguns itens.")
                st?.correctionNote?.takeIf { it.isNotBlank() }?.let { Info("Observação", it) }
                CorrectionList(st?.correctionFields ?: emptyList())
                Primary("Atualizar itens solicitados", onCorrection)
            }

            "approved" -> {
                Success("Cadastro aprovado", "O Admin já definiu seu limite. Aguarde o código de acesso.")
                st?.approvedLimit?.let { Info("Limite aprovado", brl(it)) }
            }

            "activation_sent" -> {
                Success("Código disponível", "Use o código de 6 dígitos que o Admin enviou para seu e-mail.")
                st?.approvedLimit?.let { Info("Limite aprovado", brl(it)) }
                Primary("Inserir código e criar senha", onActivation)
            }

            "active" -> Success("Conta ativa", "Sua conta já foi ativada.")
            "rejected" -> ErrorBox("A solicitação não foi aprovada.")
            else -> {
                if (!docsReady) {
                    Info("Documentos pendentes", "Envie identidade frente/verso e contracheque para a análise.")
                    Primary("Enviar documentos", onDocuments)
                } else {
                    Info("Em análise", "Seu cadastro e documentos estão aguardando a análise manual do Admin.")
                }
            }
        }

        error?.let { ErrorBox(it) }
        Secondary(if (loading) "Atualizando..." else "Atualizar status") {
            if (!loading) refresh()
        }
    }
}

@Composable
private fun CorrectionScreen(
    pending: Triple<String, String, String>?,
    onBack: () -> Unit,
    onDone: () -> Unit
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var status by remember { mutableStateOf<ApplicationStatus?>(null) }
    var error by remember { mutableStateOf<String?>(null) }
    var loading by remember { mutableStateOf(false) }
    var pickingKind by remember { mutableStateOf<String?>(null) }

    var fullName by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var cpf by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var birth by remember { mutableStateOf("") }
    var occupation by remember { mutableStateOf("") }
    var income by remember { mutableStateOf("") }
    var street by remember { mutableStateOf("") }
    var number by remember { mutableStateOf("") }
    var complement by remember { mutableStateOf("") }
    var neighborhood by remember { mutableStateOf("") }
    var city by remember { mutableStateOf("") }
    var state by remember { mutableStateOf("RS") }
    var cep by remember { mutableStateOf("") }

    fun refresh() {
        val p = pending ?: return
        scope.launch {
            try {
                status = SupabaseApi.checkApplication(p.first, p.second)
            } catch (e: Exception) {
                error = friendly(e)
            }
        }
    }

    fun pickDate() {
        val now = LocalDate.now()
        DatePickerDialog(
            context,
            { _, y, m, d -> birth = "%04d-%02d-%02d".format(y, m + 1, d) },
            now.year - 18,
            now.monthValue - 1,
            now.dayOfMonth
        ).apply {
            datePicker.maxDate = now.minusYears(18)
                .atStartOfDay(ZoneId.systemDefault()).toInstant().toEpochMilli()
        }.show()
    }

    val docLauncher = rememberLauncherForActivityResult(ActivityResultContracts.OpenDocument()) { uri ->
        val p = pending
        val kind = pickingKind
        if (uri != null && p != null && kind != null) {
            loading = true
            scope.launch {
                try {
                    val mime = context.contentResolver.getType(uri) ?: if (kind == "payslip") "application/pdf" else "image/jpeg"
                    val bytes = context.contentResolver.openInputStream(uri)?.use { it.readBytes() }
                        ?: throw IllegalStateException("Não foi possível ler o arquivo.")
                    status = SupabaseApi.uploadApplicationDocument(p.first, p.second, kind, mime, bytes)
                } catch (e: Exception) {
                    error = friendly(e)
                } finally {
                    loading = false
                    pickingKind = null
                }
            }
        }
    }

    LaunchedEffect(pending?.first) { refresh() }
    LaunchedEffect(cep.filter(Char::isDigit)) {
        val digits = cep.filter(Char::isDigit)
        if (digits.length == 8) {
            try {
                SupabaseApi.lookupCep(digits)?.let { address ->
                    if (address.street.isNotBlank()) street = address.street
                    if (address.neighborhood.isNotBlank()) neighborhood = address.neighborhood
                    if (address.city.isNotBlank()) city = address.city
                    if (address.state.isNotBlank()) state = address.state
                    if (complement.isBlank() && address.complement.isNotBlank()) complement = address.complement
                }
            } catch (_: Exception) { }
        }
    }

    Page("Atualizar cadastro", "Corrija somente o que foi solicitado.", onBack) {
        val p = pending
        val fields = status?.correctionFields ?: emptyList()

        if (p == null) {
            ErrorBox("Cadastro não encontrado.")
            return@Page
        }

        status?.correctionNote?.takeIf { it.isNotBlank() }?.let { Info("Observação do analista", it) }
        CorrectionList(fields)

        if ("full_name" in fields) Field("Nome completo", fullName) { fullName = it }
        if ("email" in fields) Field("E-mail", email, KeyboardType.Email) { email = it }
        if ("cpf" in fields) Field("CPF", cpf, KeyboardType.Number) { cpf = formatCpfInput(it) }
        if ("phone" in fields) Field("Celular", phone, KeyboardType.Phone) { phone = formatPhoneInput(it) }

        if ("birth_date" in fields) {
            Text("Data de nascimento", color = Muted, fontSize = 12.sp)
            OutlinedButton(onClick = { pickDate() }, modifier = Modifier.fillMaxWidth()) {
                Text(if (birth.isBlank()) "Selecionar nova data" else displayDate(birth))
            }
        }

        if ("occupation" in fields) Field("Profissão / ocupação", occupation) { occupation = it }
        if ("monthly_income" in fields) MoneyField("Renda mensal", income) { income = it }

        if ("address" in fields) {
            Section("Endereço")
            Field("CEP", cep, KeyboardType.Number) { cep = formatCepInput(it) }
            Field("Rua / avenida", street) { street = it }
            Field("Número", number) { number = it }
            Field("Complemento", complement) { complement = it }
            Field("Bairro", neighborhood) { neighborhood = it }
            Field("Cidade", city) { city = it }
            Field("UF", state) { state = it.uppercase().take(2) }
        }

        if ("identity_front" in fields) {
            DocumentRow("Reenviar identidade — frente", status?.documentStatus?.get("identity_front"), loading) {
                pickingKind = "identity_front"
                docLauncher.launch(arrayOf("image/*"))
            }
        }
        if ("identity_back" in fields) {
            DocumentRow("Reenviar identidade — verso", status?.documentStatus?.get("identity_back"), loading) {
                pickingKind = "identity_back"
                docLauncher.launch(arrayOf("image/*"))
            }
        }
        if ("payslip" in fields) {
            DocumentRow("Reenviar contracheque", status?.documentStatus?.get("payslip"), loading) {
                pickingKind = "payslip"
                docLauncher.launch(arrayOf("application/pdf", "image/*"))
            }
        }

        error?.let { ErrorBox(it) }

        val dataFields = fields.filterNot { it in setOf("identity_front", "identity_back", "payslip") }
        if (dataFields.isNotEmpty()) {
            Button(
                enabled = !loading,
                onClick = {
                    val updates = JSONObject()
                    if ("full_name" in fields && fullName.isNotBlank()) updates.put("full_name", fullName)
                    if ("email" in fields && email.isNotBlank()) updates.put("email", email)
                    if ("cpf" in fields && cpf.isNotBlank()) updates.put("cpf", cpf)
                    if ("phone" in fields && phone.isNotBlank()) updates.put("phone", phone)
                    if ("birth_date" in fields && birth.isNotBlank()) updates.put("birth_date", birth)
                    if ("occupation" in fields) updates.put("occupation", occupation)
                    if ("monthly_income" in fields && income.isNotBlank()) updates.put("monthly_income", moneyToDouble(income))
                    if ("address" in fields) {
                        updates.put(
                            "address",
                            JSONObject()
                                .put("address_line", street)
                                .put("address_number", number)
                                .put("address_complement", complement)
                                .put("neighborhood", neighborhood)
                                .put("city", city)
                                .put("state", state)
                                .put("postal_code", cep)
                        )
                    }

                    loading = true
                    scope.launch {
                        try {
                            SupabaseApi.updateCorrections(p.first, p.second, updates)
                            refresh()
                            if (SupabaseApi.checkApplication(p.first, p.second).status != "correction_required") onDone()
                        } catch (e: Exception) {
                            error = friendly(e)
                        } finally {
                            loading = false
                        }
                    }
                },
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Salvar correções")
            }
        }

        Secondary("Voltar para análise") { onDone() }
    }
}

@Composable
private fun ManualActivationScreen(
    email: String,
    onBack: () -> Unit,
    onActivated: (Session) -> Unit
) {
    val scope = rememberCoroutineScope()
    var code by remember { mutableStateOf("") }
    var pass by remember { mutableStateOf("") }
    var confirm by remember { mutableStateOf("") }
    var loading by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }

    Page("Ativar conta", email, onBack) {
        Info(
            "Código do Admin",
            "Digite o código de 6 dígitos enviado manualmente pelo administrador e crie sua senha."
        )
        Field("Código", code, KeyboardType.Number) { code = it.filter(Char::isDigit).take(6) }
        PassField("Nova senha", pass) { pass = it }
        PassField("Confirmar senha", confirm) { confirm = it }

        Text(
            "A senha precisa ter pelo menos 10 caracteres, com letra maiúscula, minúscula e número.",
            color = Muted,
            fontSize = 11.sp
        )

        error?.let { ErrorBox(it) }

        Button(
            enabled = !loading && code.length == 6 && pass == confirm && pass.length >= 10,
            onClick = {
                loading = true
                scope.launch {
                    try {
                        onActivated(SupabaseApi.activateManual(email, code, pass))
                    } catch (e: Exception) {
                        error = friendly(e)
                    } finally {
                        loading = false
                    }
                }
            },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text(if (loading) "Ativando..." else "Ativar e entrar")
        }
    }
}

@Composable
private fun LoginScreen(onBack: () -> Unit, onLogin: (Session) -> Unit) {
    val scope = rememberCoroutineScope()
    var email by remember { mutableStateOf("") }
    var pass by remember { mutableStateOf("") }
    var loading by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }

    Page("Entrar", "Cliente ou administrador", onBack) {
        Field("E-mail", email, KeyboardType.Email) { email = it }
        PassField("Senha", pass) { pass = it }
        error?.let { ErrorBox(it) }

        Primary(if (loading) "Entrando..." else "Entrar") {
            if (!loading) {
                loading = true
                scope.launch {
                    try {
                        onLogin(SupabaseApi.signIn(email, pass))
                    } catch (e: Exception) {
                        error = friendly(e)
                    } finally {
                        loading = false
                    }
                }
            }
        }
        Text("O login identifica automaticamente cliente ou administrador.", color = Muted, fontSize = 12.sp)
    }
}

@Composable
private fun HomeScreen(session: Session?, onLoan: () -> Unit, onLogout: () -> Unit) {
    val scope = rememberCoroutineScope()
    var home by remember { mutableStateOf<ClientHome?>(null) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }

    fun load() {
        val token = session?.accessToken ?: return
        loading = true
        scope.launch {
            try {
                home = SupabaseApi.loadClientHome(token)
                error = null
            } catch (e: Exception) {
                error = friendly(e)
            } finally { loading = false }
        }
    }
    LaunchedEffect(session?.accessToken) { load() }

    Page("Minha conta", session?.email ?: "", null) {
        if (loading && home == null) CircularProgressIndicator()
        home?.let { h ->
            val available = (h.limitAmount - h.usedLimit).coerceAtLeast(0.0)
            Card(colors = CardDefaults.cardColors(containerColor = Panel2), modifier = Modifier.fillMaxWidth()) {
                Column(Modifier.padding(18.dp)) {
                    Text("Limite disponível", color = Muted, fontSize = 12.sp)
                    Text(brl(available), fontSize = 34.sp, fontWeight = FontWeight.Black)
                    Text("Limite total ${brl(h.limitAmount)} · Em uso ${brl(h.usedLimit)}", color = Muted, fontSize = 12.sp)
                }
            }
            Spacer(Modifier.height(10.dp))
            Button(enabled = available > 0.0, onClick = onLoan, modifier = Modifier.fillMaxWidth().height(50.dp)) {
                Text(if (available > 0.0) "Solicitar empréstimo" else "Limite indisponível")
            }
            Section("Condições aprovadas")
            Two("Parcelamento", "até ${h.maxInstallments}x", "Taxa", h.monthlyRate?.let { "${pct(it * 100)}% a.m." } ?: "—")
            Section("Solicitações e empréstimos")
            if (h.loans.isEmpty()) {
                Info("Nenhuma solicitação", "Quando você solicitar crédito, o andamento aparecerá aqui.")
            } else {
                h.loans.forEach { l ->
                    Info(
                        brl(l.principal),
                        "${l.installments}x · ${loanStatusLabel(l.status)} · total ${brl(l.totalAmount)}"
                    )
                }
            }
            Info("Liberação manual", "Depois da solicitação, o Admin confere a chave Pix e faz a transferência manualmente. O app não movimenta sua conta bancária.")
        }
        error?.let { ErrorBox(it) }
        Secondary("Atualizar") { load() }
        TextButton(onClick = onLogout, modifier = Modifier.fillMaxWidth()) { Text("Sair da conta") }
    }
}

@Composable
private fun LoanRequestScreen(session: Session?, onBack: () -> Unit, onSubmitted: () -> Unit) {
    val scope = rememberCoroutineScope()
    var home by remember { mutableStateOf<ClientHome?>(null) }
    var amount by remember { mutableStateOf("") }
    var installments by remember { mutableIntStateOf(1) }
    var pixType by remember { mutableStateOf("cpf") }
    var pixKey by remember { mutableStateOf("") }
    var preview by remember { mutableStateOf<LoanPreview?>(null) }
    var readingChoice by remember { mutableStateOf<String?>(null) }
    var accepted by remember { mutableStateOf(false) }
    var showContract by remember { mutableStateOf(false) }
    var loading by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    var success by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(session?.accessToken) {
        session?.accessToken?.let {
            try { home = SupabaseApi.loadClientHome(it) } catch (e: Exception) { error = friendly(e) }
        }
    }

    if (showContract) {
        AlertDialog(
            onDismissRequest = { showContract = false },
            title = { Text("Contrato v${preview?.contractVersion ?: "0.2"}") },
            text = {
                Column(Modifier.heightIn(max = 420.dp).verticalScroll(rememberScrollState())) {
                    Text(preview?.contractBody ?: "Gere a simulação antes de abrir o contrato.", fontSize = 13.sp)
                }
            },
            confirmButton = {
                TextButton(onClick = { readingChoice = "read"; showContract = false }) { Text("Li o contrato") }
            },
            dismissButton = { TextButton(onClick = { showContract = false }) { Text("Fechar") } }
        )
    }

    Page("Solicitar empréstimo", "A liberação do Pix é manual nesta versão.", onBack) {
        val h = home
        val available = ((h?.limitAmount ?: 0.0) - (h?.usedLimit ?: 0.0)).coerceAtLeast(0.0)
        Info("Limite disponível", brl(available))
        MoneyField("Valor desejado", amount) { amount = it; preview = null; accepted = false; readingChoice = null }

        Text("Parcelas", color = Muted, fontSize = 12.sp)
        val max = (h?.maxInstallments ?: 1).coerceAtLeast(1)
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(7.dp)) {
            (1..max.coerceAtMost(6)).forEach { n ->
                FilterChip(selected = installments == n, onClick = { installments = n; preview = null; accepted = false; readingChoice = null }, label = { Text("${n}x") })
            }
        }
        if (max > 6) Text("Seu limite permite até ${max}x; nesta tela mostramos até 6x por enquanto.", color = Muted, fontSize = 11.sp)

        Section("Como você quer receber")
        Text("Chave Pix para receber o empréstimo", color = Muted, fontSize = 12.sp)
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            listOf("cpf" to "CPF", "phone" to "Telefone", "email" to "E-mail", "random" to "Aleatória").forEach { (v,label) ->
                FilterChip(selected = pixType == v, onClick = { pixType = v; pixKey = "" }, label = { Text(label, fontSize = 10.sp) })
            }
        }
        Field("Chave Pix", pixKey, if (pixType in setOf("cpf","phone")) KeyboardType.Phone else KeyboardType.Text) {
            pixKey = when (pixType) {
                "cpf" -> formatCpfInput(it)
                "phone" -> formatPhoneInput(it)
                else -> it.take(120)
            }
        }

        Section("Forma de pagamento das parcelas")
        Card(colors = CardDefaults.cardColors(containerColor = Mint.copy(alpha = .10f)), modifier = Modifier.fillMaxWidth()) {
            Column(Modifier.padding(14.dp)) {
                Text("Pix", color = Mint, fontWeight = FontWeight.Bold)
                Text("Disponível nesta versão. O QR Code/chave de cobrança será mostrado nas parcelas.", color = Muted, fontSize = 12.sp)
            }
        }
        Card(colors = CardDefaults.cardColors(containerColor = Panel2), modifier = Modifier.fillMaxWidth().padding(top = 6.dp)) {
            Column(Modifier.padding(14.dp)) {
                Text("Cartão de crédito — em preparação", fontWeight = FontWeight.Bold)
                Text("Será ativado apenas quando houver uma adquirente/tokenização. O CrediFlow não armazenará número completo nem CVV.", color = Muted, fontSize = 12.sp)
            }
        }

        val value = moneyToDouble(amount)
        Button(
            enabled = !loading && value != null && value > 0 && value <= available && pixKey.filterNot(Char::isWhitespace).isNotBlank(),
            onClick = {
                val token = session?.accessToken ?: return@Button
                loading = true; error = null
                scope.launch {
                    try { preview = SupabaseApi.previewLoan(token, value!!, installments) }
                    catch (e: Exception) { error = friendly(e) }
                    finally { loading = false }
                }
            },
            modifier = Modifier.fillMaxWidth()
        ) { Text(if (loading) "Calculando..." else "Ver condições") }

        preview?.let { p ->
            Section("Resumo")
            Two("Parcela", brl(p.installmentValue), "Total", brl(p.total))
            Info("Taxa aprovada", "${pct(p.monthlyRate * 100)}% ao mês · ${p.installments} parcela(s)")
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedButton(onClick = { showContract = true }, modifier = Modifier.weight(1f)) { Text("Ler contrato") }
                OutlinedButton(onClick = { readingChoice = "skipped_reading" }, modifier = Modifier.weight(1f)) { Text("Pular leitura") }
            }
            Text(
                when (readingChoice) { "read" -> "Contrato lido."; "skipped_reading" -> "Leitura pulada. O aceite continua obrigatório."; else -> "Escolha ler ou pular a leitura." },
                color = if (readingChoice != null) Mint else Warning,
                fontSize = 12.sp
            )
            Row(verticalAlignment = Alignment.CenterVertically) {
                Checkbox(checked = accepted, onCheckedChange = { accepted = it })
                Text("Li ou optei por pular a leitura e ACEITO as condições da proposta e do contrato.", fontSize = 12.sp, color = Muted)
            }
            Button(
                enabled = !loading && accepted && readingChoice != null,
                onClick = {
                    val token = session?.accessToken ?: return@Button
                    val key = pixKey.trim()
                    loading = true; error = null
                    scope.launch {
                        try {
                            val r = SupabaseApi.submitLoanRequest(token, p.amount, p.installments, pixType, key, readingChoice!!)
                            success = "Solicitação ${r.contractNumber} enviada. Aguarde o Admin fazer o Pix."
                        } catch (e: Exception) { error = friendly(e) }
                        finally { loading = false }
                    }
                },
                modifier = Modifier.fillMaxWidth()
            ) { Text(if (loading) "Enviando..." else "Confirmar solicitação") }
        }
        success?.let {
            Success("Solicitação enviada", it)
            Primary("Voltar para minha conta", onSubmitted)
        }
        error?.let { ErrorBox(it) }
    }
}

@Composable
private fun AdminScreen(
    session: Session?,
    onOpen: (AdminApplication) -> Unit,
    onLogout: () -> Unit
) {
    val scope = rememberCoroutineScope()
    var items by remember { mutableStateOf<List<AdminApplication>>(emptyList()) }
    var loans by remember { mutableStateOf<List<AdminLoanRequest>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    var note by remember { mutableStateOf("") }

    fun load() {
        val token = session?.accessToken ?: return
        loading = true
        scope.launch {
            try {
                items = SupabaseApi.listApplications(token)
                loans = SupabaseApi.listAdminLoanRequests(token)
                error = null
            } catch (e: Exception) { error = friendly(e) }
            finally { loading = false }
        }
    }
    LaunchedEffect(session?.accessToken) { load() }

    Page("Painel Admin", session?.email ?: "", null) {
        Info("Análise manual", "A pontuação cadastral é apenas antifraude. Limite, taxa e aprovação continuam sendo definidos manualmente pelo Admin.")

        Section("Solicitações de empréstimo")
        val requested = loans.filter { it.status == "requested" }
        if (requested.isEmpty()) Info("Nenhum Pix pendente", "Novas solicitações aprovadas pelo próprio limite aparecerão aqui para liberação manual.")
        requested.forEach { l ->
            Card(colors = CardDefaults.cardColors(containerColor = Panel2), modifier = Modifier.fillMaxWidth().padding(vertical = 5.dp)) {
                Column(Modifier.padding(14.dp)) {
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text(l.fullName, fontWeight = FontWeight.Bold)
                        Text(brl(l.principal), color = Mint, fontWeight = FontWeight.Bold)
                    }
                    Text(l.email, color = Muted, fontSize = 11.sp)
                    Text("${l.installments}x · total ${brl(l.totalAmount)} · taxa ${pct(l.monthlyRate*100)}% a.m.", color = Muted, fontSize = 12.sp)
                    Spacer(Modifier.height(5.dp))
                    Text("Chave Pix (${pixTypeLabel(l.pixType)}):", color = Muted, fontSize = 11.sp)
                    Text(l.pixValue.ifBlank { l.pixMasked }, fontWeight = FontWeight.Bold)
                    Text("Contrato ${l.contractNumber} · ${if (l.readingChoice=="read") "lido" else "leitura pulada"}", color = Muted, fontSize = 11.sp)
                    Field("Observação da transferência", note) { note = it }
                    Button(onClick = {
                        val token = session?.accessToken ?: return@Button
                        loading = true
                        scope.launch {
                            try { SupabaseApi.confirmManualDisbursement(token, l.id, note); note=""; load() }
                            catch (e: Exception) { error = friendly(e); loading=false }
                        }
                    }, enabled = !loading, modifier = Modifier.fillMaxWidth()) { Text("Confirmar Pix enviado") }
                    OutlinedButton(onClick = {
                        val token = session?.accessToken ?: return@OutlinedButton
                        loading = true
                        scope.launch {
                            try { SupabaseApi.rejectLoanRequest(token, l.id, note); note=""; load() }
                            catch (e: Exception) { error = friendly(e); loading=false }
                        }
                    }, enabled = !loading, modifier = Modifier.fillMaxWidth()) { Text("Não liberar esta solicitação", color = Danger) }
                }
            }
        }

        Section("Cadastros para análise")
        if (loading && items.isEmpty()) CircularProgressIndicator()
        items.filter { it.status != "cancelled" }.forEach { app ->
            Card(modifier = Modifier.fillMaxWidth().padding(vertical = 5.dp).clickable { onOpen(app) }, colors = CardDefaults.cardColors(containerColor = Panel2)) {
                Column(Modifier.padding(15.dp)) {
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text(app.fullName, fontWeight = FontWeight.Bold)
                        StatusPill(app.status)
                    }
                    Text(app.email, color = Muted, fontSize = 12.sp)
                    Text("CPF ${maskCpf(app.cpf)} · ${app.city}/${app.state}", color = Muted, fontSize = 12.sp)
                }
            }
        }
        Section("Últimas operações")
        loans.filter { it.status != "requested" }.take(10).forEach { l ->
            Info("${l.fullName} · ${brl(l.principal)}", "${loanStatusLabel(l.status)} · ${l.installments}x")
        }
        error?.let { ErrorBox(it) }
        Secondary("Atualizar painel") { load() }
        TextButton(onClick = onLogout, modifier = Modifier.fillMaxWidth()) { Text("Sair do Admin") }
    }
}

@Composable
private fun AdminDetailScreen(
    session: Session?,
    application: AdminApplication?,
    onBack: () -> Unit,
    onChanged: () -> Unit
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var detail by remember { mutableStateOf<AdminDetail?>(null) }
    var error by remember { mutableStateOf<String?>(null) }
    var loading by remember { mutableStateOf(false) }

    var limit by remember { mutableStateOf("") }
    var rate by remember { mutableStateOf("") }
    var maxInstallments by remember { mutableStateOf("1") }
    var tier by remember { mutableStateOf("A") }
    var notes by remember { mutableStateOf("") }
    var activationResult by remember { mutableStateOf<ActivationCodeResult?>(null) }

    val correctionOptions = linkedMapOf(
        "full_name" to "Nome completo",
        "email" to "E-mail",
        "cpf" to "CPF",
        "phone" to "Telefone",
        "birth_date" to "Data de nascimento",
        "address" to "Endereço",
        "occupation" to "Profissão / ocupação",
        "monthly_income" to "Renda mensal",
        "identity_front" to "Identidade — frente",
        "identity_back" to "Identidade — verso",
        "payslip" to "Contracheque"
    )
    val selectedCorrections = remember { mutableStateMapOf<String, Boolean>() }

    fun load() {
        val token = session?.accessToken
        val app = application
        if (token == null || app == null) return
        loading = true
        scope.launch {
            try {
                val loaded = SupabaseApi.adminDetail(token, app.id)
                detail = loaded
                val current = loaded.application
                limit = current.approvedLimit?.let { String.format(Locale("pt", "BR"), "%.2f", it) } ?: ""
                rate = current.approvedMonthlyRate?.let { String.format(Locale("pt", "BR"), "%.2f", it * 100.0) } ?: ""
                maxInstallments = current.approvedMaxInstallments?.toString() ?: "1"
                tier = current.approvedRiskTier?.takeIf { it.isNotBlank() } ?: "A"
                error = null
            } catch (e: Exception) {
                error = friendly(e)
            } finally {
                loading = false
            }
        }
    }

    fun openEmail(mail: CorrectionMail) {
        val mailto = "mailto:${Uri.encode(mail.recipient)}?subject=${Uri.encode(mail.subject)}&body=${Uri.encode(mail.body)}"
        val intent = Intent(Intent.ACTION_SENDTO, Uri.parse(mailto))
        try {
            context.startActivity(intent)
        } catch (_: Exception) {
            error = "Nenhum aplicativo de e-mail encontrado."
        }
    }

    LaunchedEffect(application?.id) { load() }

    Page("Analisar cadastro", application?.fullName ?: "", onBack) {
        val d = detail
        val app = d?.application ?: application

        if (app == null) {
            ErrorBox("Cadastro não encontrado.")
            return@Page
        }

        if (loading && d == null) CircularProgressIndicator()

        Section("Cadastro")
        Two("CPF", maskCpf(app.cpf), "Nascimento", displayDate(app.birthDate))
        Two("Telefone", formatPhoneInput(app.phone), "Cidade", "${app.city}/${app.state}")
        Two("Ocupação", app.occupation.ifBlank { "—" }, "Renda", app.monthlyIncome?.let(::brl) ?: "—")

        d?.verificationScore?.let {
            Info(
                "Verificação cadastral",
                "$it/100 · ${verificationLabel(d.verificationLevel)} — apoio antifraude, não aprovação automática."
            )
        }

        Section("Documentos")
        val required = listOf(
            "identity_front" to "Identidade — frente",
            "identity_back" to "Identidade — verso",
            "payslip" to "Contracheque"
        )
        required.forEach { (kind, label) ->
            val doc = d?.documents?.firstOrNull { it.kind == kind }
            Card(
                colors = CardDefaults.cardColors(containerColor = Panel2),
                modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)
            ) {
                Row(
                    Modifier.fillMaxWidth().padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column(Modifier.weight(1f)) {
                        Text(label, fontWeight = FontWeight.Bold)
                        Text(doc?.status ?: "Não enviado", color = Muted, fontSize = 12.sp)
                    }
                    if (!doc?.signedUrl.isNullOrBlank()) {
                        TextButton(onClick = {
                            try {
                                context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(doc?.signedUrl)))
                            } catch (_: Exception) {
                                error = "Não foi possível abrir o documento."
                            }
                        }) { Text("Abrir") }
                    }
                }
            }
        }

        Section("Solicitar atualização")
        correctionOptions.forEach { (key, label) ->
            Row(verticalAlignment = Alignment.CenterVertically) {
                Checkbox(
                    checked = selectedCorrections[key] == true,
                    onCheckedChange = { selectedCorrections[key] = it }
                )
                Text(label)
            }
        }
        Field("Observação para o cliente", notes) { notes = it }

        Button(
            enabled = selectedCorrections.values.any { it } && !loading,
            onClick = {
                val fields = selectedCorrections.filterValues { it }.keys.toList()
                loading = true
                scope.launch {
                    try {
                        val mail = SupabaseApi.requestCorrection(
                            session?.accessToken ?: return@launch,
                            app.id,
                            fields,
                            notes
                        )
                        openEmail(mail)
                        onChanged()
                    } catch (e: Exception) {
                        error = friendly(e)
                    } finally {
                        loading = false
                    }
                }
            },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Solicitar correção e preparar e-mail")
        }

        Section("Decisão manual")
        MoneyField("Limite aprovado", limit) { limit = it }
        Field("Taxa mensal (%)", rate, KeyboardType.Decimal) { rate = it }
        Field("Máximo de parcelas", maxInstallments, KeyboardType.Number) { maxInstallments = it.filter(Char::isDigit).take(2) }
        Field("Faixa interna (A/B/C/D)", tier) { tier = it.uppercase().take(1) }

        Button(
            enabled = !loading && limit.isNotBlank() && rate.isNotBlank(),
            onClick = {
                val l = moneyToDouble(limit)
                val r = rate.replace(",", ".").toDoubleOrNull()
                val m = maxInstallments.toIntOrNull()
                if (l == null || r == null || m == null || l <= 0 || r < 0 || m < 1) {
                    error = "Preencha limite, taxa e parcelas corretamente."
                } else {
                    loading = true
                    scope.launch {
                        try {
                            SupabaseApi.recordReview(
                                session?.accessToken ?: return@launch,
                                app.id,
                                "approved",
                                l,
                                tier,
                                r / 100.0,
                                m,
                                notes
                            )
                            onChanged()
                        } catch (e: Exception) {
                            error = friendly(e)
                        } finally {
                            loading = false
                        }
                    }
                }
            },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Aprovar cadastro")
        }

        OutlinedButton(
            enabled = !loading,
            onClick = {
                loading = true
                scope.launch {
                    try {
                        SupabaseApi.recordReview(
                            session?.accessToken ?: return@launch,
                            app.id,
                            "rejected",
                            null,
                            null,
                            null,
                            null,
                            notes.ifBlank { "Não aprovado na análise manual" }
                        )
                        onChanged()
                    } catch (e: Exception) {
                        error = friendly(e)
                    } finally {
                        loading = false
                    }
                }
            },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Não aprovar", color = Danger)
        }

        if (app.status in setOf("approved", "activation_sent")) {
            Section("Ativação manual")
            Button(
                enabled = !loading,
                onClick = {
                    loading = true
                    scope.launch {
                        try {
                            val result = SupabaseApi.generateActivation(
                                session?.accessToken ?: return@launch,
                                app.id
                            )
                            activationResult = result
                            val mail = CorrectionMail(
                                result.email,
                                "CrediFlow — código de acesso",
                                "Olá! Seu cadastro CrediFlow foi aprovado.\n\nCódigo de acesso: ${result.code}\n\nEste código expira em 15 minutos. Abra o CrediFlow, toque em “Acompanhar minha análise”, informe o código e crie sua senha.\n\nSe você não solicitou este cadastro, ignore esta mensagem."
                            )
                            openEmail(mail)
                        } catch (e: Exception) {
                            error = friendly(e)
                        } finally {
                            loading = false
                        }
                    }
                },
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Gerar código e preparar e-mail")
            }

            activationResult?.let { generated ->
                Success(
                    "Código gerado: ${generated.code}",
                    "Envie este código para ${generated.email}. Ele expira em 15 minutos. Se o e-mail não preencher sozinho, toque no botão abaixo para abrir novamente."
                )
                OutlinedButton(
                    onClick = {
                        openEmail(
                            CorrectionMail(
                                generated.email,
                                "CrediFlow — código de acesso",
                                "Olá! Seu cadastro CrediFlow foi aprovado.\n\nCódigo de acesso: ${generated.code}\n\nEste código expira em 15 minutos. Abra o CrediFlow, toque em “Acompanhar minha análise”, informe o código e crie sua senha.\n\nSe você não solicitou este cadastro, ignore esta mensagem."
                            )
                        )
                    },
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text("Abrir e-mail preenchido novamente")
                }
            }
        }

        error?.let { ErrorBox(it) }
        Secondary("Atualizar dados") { load() }
    }
}

@Composable
private fun DocumentRow(label: String, status: String?, loading: Boolean, onPick: () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth().padding(vertical = 5.dp),
        colors = CardDefaults.cardColors(containerColor = Panel2)
    ) {
        Row(
            Modifier.fillMaxWidth().padding(14.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Column(Modifier.weight(1f)) {
                Text(label, fontWeight = FontWeight.Bold)
                Text(
                    when (status) {
                        "uploaded" -> "Enviado"
                        "verified" -> "Verificado"
                        "rejected" -> "Reenvio solicitado"
                        else -> "Pendente"
                    },
                    color = when (status) {
                        "uploaded", "verified" -> Mint
                        "rejected" -> Danger
                        else -> Warning
                    },
                    fontSize = 12.sp
                )
            }
            OutlinedButton(enabled = !loading, onClick = onPick) {
                Text(if (status == null) "Enviar" else "Trocar")
            }
        }
    }
}

@Composable
private fun CorrectionList(fields: List<String>) {
    if (fields.isEmpty()) return
    val labels = mapOf(
        "full_name" to "Nome completo",
        "email" to "E-mail",
        "cpf" to "CPF",
        "phone" to "Telefone",
        "birth_date" to "Data de nascimento",
        "address" to "Endereço",
        "occupation" to "Profissão / ocupação",
        "monthly_income" to "Renda mensal",
        "identity_front" to "Identidade — frente",
        "identity_back" to "Identidade — verso",
        "payslip" to "Contracheque"
    )
    Card(
        colors = CardDefaults.cardColors(containerColor = Panel2),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(Modifier.padding(14.dp)) {
            Text("Itens solicitados", fontWeight = FontWeight.Bold)
            fields.forEach { Text("• ${labels[it] ?: it}", color = Muted) }
        }
    }
}

@Composable
private fun StatusPill(status: String) {
    val text = when (status) {
        "under_review" -> "Em análise"
        "correction_required" -> "Correção"
        "approved" -> "Aprovado"
        "activation_sent" -> "Código gerado"
        "active" -> "Ativo"
        "rejected" -> "Não aprovado"
        else -> status
    }
    val color = when (status) {
        "approved", "activation_sent", "active" -> Mint
        "rejected" -> Danger
        "correction_required" -> Warning
        else -> Blue
    }
    Surface(color = color.copy(alpha = .15f), shape = RoundedCornerShape(999.dp)) {
        Text(text, color = color, fontSize = 11.sp, modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp))
    }
}

@Composable
private fun Page(title: String, subtitle: String, onBack: (() -> Unit)?, content: @Composable ColumnScope.() -> Unit) {
    Column(
        Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(20.dp)
    ) {
        if (onBack != null) {
            TextButton(onClick = onBack) { Text("← Voltar") }
        }
        Text(title, fontSize = 28.sp, fontWeight = FontWeight.Black)
        if (subtitle.isNotBlank()) {
            Text(subtitle, color = Muted, fontSize = 13.sp)
        }
        Spacer(Modifier.height(18.dp))
        content()
        Spacer(Modifier.height(36.dp))
    }
}

@Composable
private fun Field(
    label: String,
    value: String,
    keyboard: KeyboardType = KeyboardType.Text,
    onChange: (String) -> Unit
) {
    OutlinedTextField(
        value = value,
        onValueChange = onChange,
        label = { Text(label) },
        singleLine = true,
        keyboardOptions = KeyboardOptions(keyboardType = keyboard),
        modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)
    )
}

@Composable
private fun MoneyField(label: String, value: String, onChange: (String) -> Unit) {
    OutlinedTextField(
        value = value,
        onValueChange = { raw ->
            val cleaned = raw.filter { it.isDigit() || it == ',' || it == '.' }.take(14)
            onChange(cleaned)
        },
        label = { Text(label) },
        prefix = { Text("R$ ") },
        singleLine = true,
        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
        modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)
    )
}

@Composable
private fun PassField(label: String, value: String, onChange: (String) -> Unit) {
    OutlinedTextField(
        value = value,
        onValueChange = onChange,
        label = { Text(label) },
        singleLine = true,
        visualTransformation = PasswordVisualTransformation(),
        modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)
    )
}

@Composable
private fun Section(text: String) {
    Spacer(Modifier.height(14.dp))
    Text(text, color = Blue, fontWeight = FontWeight.Bold, fontSize = 14.sp)
    Spacer(Modifier.height(6.dp))
}

@Composable
private fun Primary(text: String, onClick: () -> Unit) {
    Button(onClick = onClick, modifier = Modifier.fillMaxWidth().height(50.dp)) {
        Text(text)
    }
}

@Composable
private fun Secondary(text: String, onClick: () -> Unit) {
    OutlinedButton(onClick = onClick, modifier = Modifier.fillMaxWidth().height(48.dp)) {
        Text(text)
    }
}

@Composable
private fun Info(title: String, body: String) {
    Card(
        colors = CardDefaults.cardColors(containerColor = Panel2),
        modifier = Modifier.fillMaxWidth().padding(vertical = 6.dp)
    ) {
        Column(Modifier.padding(14.dp)) {
            Text(title, fontWeight = FontWeight.Bold)
            Text(body, color = Muted, fontSize = 12.sp, lineHeight = 17.sp)
        }
    }
}

@Composable
private fun Success(title: String, body: String) {
    Card(
        colors = CardDefaults.cardColors(containerColor = Mint.copy(alpha = .12f)),
        modifier = Modifier.fillMaxWidth().padding(vertical = 6.dp)
    ) {
        Column(Modifier.padding(14.dp)) {
            Text(title, color = Mint, fontWeight = FontWeight.Bold)
            Text(body, color = Color(0xFFD9FFF3), fontSize = 12.sp)
        }
    }
}

@Composable
private fun ErrorBox(text: String) {
    Card(
        colors = CardDefaults.cardColors(containerColor = Danger.copy(alpha = .12f)),
        modifier = Modifier.fillMaxWidth().padding(vertical = 6.dp)
    ) {
        Text(text, color = Color(0xFFFFC7CD), modifier = Modifier.padding(14.dp))
    }
}

@Composable
private fun Step(number: String, title: String, status: String, color: Color) {
    Row(Modifier.fillMaxWidth().padding(vertical = 7.dp), verticalAlignment = Alignment.CenterVertically) {
        Box(
            Modifier.size(32.dp).background(color.copy(alpha = .15f), RoundedCornerShape(10.dp)),
            contentAlignment = Alignment.Center
        ) {
            Text(number, color = color, fontWeight = FontWeight.Bold)
        }
        Spacer(Modifier.width(12.dp))
        Column(Modifier.weight(1f)) {
            Text(title, fontWeight = FontWeight.Bold)
            Text(status, color = color, fontSize = 12.sp)
        }
    }
}

@Composable
private fun Two(a: String, av: String, b: String, bv: String) {
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
        Card(Modifier.weight(1f), colors = CardDefaults.cardColors(containerColor = Panel2)) {
            Column(Modifier.padding(12.dp)) {
                Text(a, color = Muted, fontSize = 11.sp)
                Text(av, fontWeight = FontWeight.Bold)
            }
        }
        Card(Modifier.weight(1f), colors = CardDefaults.cardColors(containerColor = Panel2)) {
            Column(Modifier.padding(12.dp)) {
                Text(b, color = Muted, fontSize = 11.sp)
                Text(bv, fontWeight = FontWeight.Bold)
            }
        }
    }
}

private fun friendly(e: Exception): String {
    val raw = e.message.orEmpty()
    return when {
        raw.contains("minimum_age_18") -> "É necessário ter pelo menos 18 anos."
        raw.contains("invalid_birth_date") -> "Data de nascimento inválida."
        raw.contains("invalid_cpf") -> "CPF inválido."
        raw.contains("application_already_exists") -> "Já existe um cadastro com esses dados."
        raw.contains("file_too_large") -> "Arquivo muito grande. Limite de 10 MB."
        raw.contains("identity_must_be_image") -> "A identidade deve ser enviada como foto."
        raw.contains("code_expired") -> "O código expirou. Peça um novo código ao Admin."
        raw.contains("invalid_code") -> "Código incorreto."
        raw.contains("weak_password") -> "Senha fraca. Use 10+ caracteres com maiúscula, minúscula e número."
        raw.contains("amount_exceeds_available_limit") -> "O valor solicitado ultrapassa o limite disponível."
        raw.contains("installments_exceed_policy") -> "A quantidade de parcelas ultrapassa o permitido para sua conta."
        raw.contains("invalid_pix_key") -> "Informe uma chave Pix válida para receber o valor."
        raw.contains("card_provider_not_configured") -> "Pagamento por cartão ainda não está disponível."
        raw.contains("account_not_active") -> "Sua conta ainda não está ativa para solicitar crédito."
        raw.contains("active_limit_not_found") -> "Não encontramos um limite ativo para sua conta."
        raw.contains("forbidden") -> "Acesso não autorizado."
        else -> raw.ifBlank { "Ocorreu um erro. Tente novamente." }
    }
}

private fun brl(v: Double): String =
    NumberFormat.getCurrencyInstance(Locale("pt", "BR")).format(v)

private fun pct(v: Double): String =
    String.format(Locale("pt", "BR"), "%.2f", v)

private fun displayDate(iso: String): String {
    if (!Regex("""\d{4}-\d{2}-\d{2}""").matches(iso)) return iso.ifBlank { "—" }
    val p = iso.split("-")
    return "${p[2]}/${p[1]}/${p[0]}"
}

private fun maskCpf(cpf: String): String {
    val d = cpf.filter(Char::isDigit)
    return if (d.length == 11) "***.${d.substring(3, 6)}.${d.substring(6, 9)}-**" else cpf
}

private fun formatCpfInput(value: String): String {
    val d = value.filter(Char::isDigit).take(11)
    return when {
        d.length <= 3 -> d
        d.length <= 6 -> "${d.substring(0,3)}.${d.substring(3)}"
        d.length <= 9 -> "${d.substring(0,3)}.${d.substring(3,6)}.${d.substring(6)}"
        else -> "${d.substring(0,3)}.${d.substring(3,6)}.${d.substring(6,9)}-${d.substring(9)}"
    }
}

private fun formatPhoneInput(value: String): String {
    val d = value.filter(Char::isDigit).take(11)
    if (d.isEmpty()) return ""
    return when {
        d.length <= 2 -> "($d"
        d.length <= 6 -> "(${d.substring(0,2)}) ${d.substring(2)}"
        d.length <= 10 -> "(${d.substring(0,2)}) ${d.substring(2,6)}-${d.substring(6)}"
        else -> "(${d.substring(0,2)}) ${d.substring(2,7)}-${d.substring(7)}"
    }
}

private fun formatCepInput(value: String): String {
    val d = value.filter(Char::isDigit).take(8)
    return if (d.length <= 5) d else "${d.substring(0,5)}-${d.substring(5)}"
}

private fun moneyToDouble(value: String): Double? {
    val normalized = value.trim().replace("R$", "").replace(" ", "").replace(",", ".")
    return normalized.toDoubleOrNull()
}

private fun isValidCpf(value: String): Boolean {
    val d = value.filter(Char::isDigit)
    if (d.length != 11 || d.all { it == d.first() }) return false
    fun digit(base: Int): Int {
        var sum = 0
        var weight = base + 1
        for (i in 0 until base) sum += (d[i] - '0') * weight--
        val r = (sum * 10) % 11
        return if (r == 10) 0 else r
    }
    return digit(9) == (d[9] - '0') && digit(10) == (d[10] - '0')
}

private fun loanStatusLabel(status: String): String = when (status) {
    "requested" -> "Aguardando Pix do Admin"
    "approved", "disbursing" -> "Em liberação"
    "active" -> "Ativo"
    "paid" -> "Quitado"
    "late" -> "Em atraso"
    "defaulted" -> "Inadimplente"
    "rejected" -> "Não liberado"
    "cancelled" -> "Cancelado"
    else -> status
}

private fun pixTypeLabel(type: String): String = when (type) {
    "cpf" -> "CPF"
    "phone" -> "Telefone"
    "email" -> "E-mail"
    "random" -> "Aleatória"
    else -> type
}

private fun verificationLabel(level: String?): String = when (level) {
    "strong" -> "Verificação forte"
    "basic" -> "Verificação básica"
    "review" -> "Revisão necessária"
    else -> "Incompleta"
}
