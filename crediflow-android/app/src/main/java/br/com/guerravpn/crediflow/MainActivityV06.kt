package br.com.guerravpn.crediflow

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.text.NumberFormat
import java.net.URL
import java.util.Locale

private val PBlue = CrediFlowProfessionalColors.Primary
private val PBlueSoft = CrediFlowProfessionalColors.PrimarySoft
private val PBg = CrediFlowProfessionalColors.Background
private val PSurface = CrediFlowProfessionalColors.Surface
private val PSurfaceAlt = CrediFlowProfessionalColors.SurfaceAlt
private val PText = CrediFlowProfessionalColors.TextPrimary
private val PMuted = CrediFlowProfessionalColors.TextSecondary
private val PSuccess = CrediFlowProfessionalColors.Success
private val PWarning = CrediFlowProfessionalColors.Warning
private val PDanger = CrediFlowProfessionalColors.Danger

private enum class V06Screen {
    WELCOME, REGISTER, ANALYSIS, ACTIVATE, CREATE_PASSWORD, LOGIN,
    HOME, LOAN, PROFILE, ADMIN, ADMIN_DETAIL, ADMIN_AUDIT
}

class MainActivityV06 : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            CrediFlowProfessionalTheme {
                V06App()
            }
        }
    }
}

@Composable
private fun V06App() {
    val context = LocalContext.current
    val store = remember { SessionStore(context) }
    var session by remember { mutableStateOf(store.session()) }
    var selectedApplication by remember { mutableStateOf<AdminApplication?>(null) }
    var screen by remember {
        mutableStateOf(
            when {
                session?.role == "admin" -> V06Screen.ADMIN
                session != null && session?.activationRequired == false -> V06Screen.HOME
                session != null -> V06Screen.CREATE_PASSWORD
                store.pendingApplication() != null -> V06Screen.ANALYSIS
                else -> V06Screen.WELCOME
            }
        )
    }

    Surface(modifier = Modifier.fillMaxSize(), color = PBg) {
        when (screen) {
            V06Screen.WELCOME -> V08Welcome(
                hasAnalysis = store.pendingApplication() != null,
                onRegister = { screen = V06Screen.REGISTER },
                onLogin = { screen = V06Screen.LOGIN },
                onAnalysis = { screen = V06Screen.ANALYSIS }
            )
            V06Screen.REGISTER -> V06Register(
                onBack = { screen = V06Screen.WELCOME },
                onCreated = { id, secret, email ->
                    store.savePendingApplication(id, secret, email)
                    screen = V06Screen.ANALYSIS
                }
            )
            V06Screen.ANALYSIS -> V08Analysis(
                pending = store.pendingApplication(),
                onBack = { screen = V06Screen.WELCOME },
                onActivation = { screen = V06Screen.ACTIVATE }
            )
            V06Screen.ACTIVATE -> V06Activation(
                email = store.pendingApplication()?.third.orEmpty(),
                onBack = { screen = V06Screen.ANALYSIS },
                onVerified = {
                    store.saveSession(it)
                    session = it
                    screen = V06Screen.CREATE_PASSWORD
                }
            )
            V06Screen.CREATE_PASSWORD -> V06CreatePassword(
                session = session,
                onDone = {
                    store.saveSession(it)
                    store.clearPendingApplication()
                    session = it
                    screen = if (it.role == "admin") V06Screen.ADMIN else V06Screen.HOME
                },
                onCancel = {
                    store.clearSession(); session = null; screen = V06Screen.WELCOME
                }
            )
            V06Screen.LOGIN -> V06Login(
                onBack = { screen = V06Screen.WELCOME },
                onLogin = {
                    store.saveSession(it)
                    session = it
                    screen = when {
                        it.role == "admin" -> V06Screen.ADMIN
                        it.activationRequired -> V06Screen.CREATE_PASSWORD
                        else -> V06Screen.HOME
                    }
                }
            )
            V06Screen.HOME -> V06Home(
                session = session,
                onLoan = { screen = V06Screen.LOAN },
                onProfile = { screen = V06Screen.PROFILE },
                onLogout = {
                    store.clearSession(); session = null; screen = V06Screen.WELCOME
                }
            )
            V06Screen.LOAN -> V08Loan(session) { screen = V06Screen.HOME }
            V06Screen.PROFILE -> V06Profile(
                session = session,
                onBack = { screen = V06Screen.HOME },
                onLogout = {
                    store.clearSession(); session = null; screen = V06Screen.WELCOME
                }
            )
            V06Screen.ADMIN -> V08Admin(
                session = session,
                onSelect = { selectedApplication = it; screen = V06Screen.ADMIN_DETAIL },
                onAudit = { screen = V06Screen.ADMIN_AUDIT },
                onLogout = {
                    store.clearSession(); session = null; screen = V06Screen.WELCOME
                }
            )
            V06Screen.ADMIN_DETAIL -> V08AdminDetail(
                session = session,
                application = selectedApplication,
                onBack = { screen = V06Screen.ADMIN },
                onUpdated = { screen = V06Screen.ADMIN }
            )
            V06Screen.ADMIN_AUDIT -> V06AdminAudit(session) { screen = V06Screen.ADMIN }
        }
    }
}

@Composable
private fun V06Welcome(hasAnalysis:Boolean,onRegister:()->Unit,onLogin:()->Unit,onAnalysis:()->Unit) {
    Column(
        Modifier.fillMaxSize().padding(24.dp),
        verticalArrangement = Arrangement.Center
    ) {
        V06Logo()
        Spacer(Modifier.height(28.dp))
        Text("CREDIFLOW", color = PBlueSoft, fontSize = 12.sp, fontWeight = FontWeight.Bold)
        Text("Crédito simples, análise clara.", color = PText, fontSize = 34.sp, lineHeight = 39.sp, fontWeight = FontWeight.Black)
        Spacer(Modifier.height(10.dp))
        Text("Versão 0.7", color = PMuted, fontSize = 13.sp)
        Spacer(Modifier.height(30.dp))
        V06Primary("Criar cadastro", onRegister)
        Spacer(Modifier.height(10.dp))
        V06Secondary("Entrar na minha conta", onLogin)
        TextButton(onClick = onAnalysis, modifier = Modifier.fillMaxWidth()) {
            Text("Acompanhar solicitação")
        }
        Spacer(Modifier.height(18.dp))
        V06Info("Fluxo da conta", "Cadastro → Open Finance → análise manual → aprovação → código por e-mail → criação de senha.")
    }
}

@Composable
private fun V06Register(onBack:()->Unit,onCreated:(String,String,String)->Unit) {
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

    V06Page("Cadastro", "Dados para análise inicial", onBack) {
        V06Section("Identidade")
        V06Field("Nome civil completo", name) { name = it }
        V06Field("E-mail", email, KeyboardType.Email) { email = it }
        V06Field("CPF", cpf, KeyboardType.Number) { cpf = it }
        V06Field("Celular", phone, KeyboardType.Phone) { phone = it }
        V06Field("Nascimento (AAAA-MM-DD)", birth) { birth = it }
        V06Section("Endereço")
        V06Field("Rua / avenida", street) { street = it }
        V06Field("Número", number) { number = it }
        V06Field("Complemento", complement) { complement = it }
        V06Field("Bairro", neighborhood) { neighborhood = it }
        V06Field("Cidade", city) { city = it }
        V06Field("UF", state) { state = it.uppercase().take(2) }
        V06Field("CEP", cep, KeyboardType.Number) { cep = it }
        V06Section("Dados profissionais")
        V06Field("Profissão / ocupação", occupation) { occupation = it }
        V06Field("Renda mensal aproximada", income, KeyboardType.Decimal) { income = it }

        Row(verticalAlignment = Alignment.Top) {
            Checkbox(checked = consent, onCheckedChange = { consent = it })
            Text(
                "Confirmo que os dados são verdadeiros e autorizo o uso para cadastro e análise.",
                color = PMuted, fontSize = 12.sp, lineHeight = 17.sp,
                modifier = Modifier.padding(top = 12.dp)
            )
        }
        error?.let { V06Error(it) }
        Button(
            onClick = {
                val inc = income.replace(",", ".").toDoubleOrNull()
                if (!consent) error = "Aceite os termos para continuar."
                else if (listOf(name,email,cpf,phone,birth,street,number,neighborhood,city,state,cep).any { it.isBlank() }) error = "Preencha os campos obrigatórios."
                else if (inc == null || inc < 0) error = "Informe uma renda válida."
                else {
                    loading = true; error = null
                    scope.launch {
                        try {
                            val r = SupabaseApi.submitApplication(name.trim(),email.trim(),cpf,phone,birth.trim(),street.trim(),number.trim(),complement.trim(),neighborhood.trim(),city.trim(),state.trim(),cep,occupation.trim(),inc)
                            onCreated(r.first, r.second, email.trim())
                        } catch (e:Exception) { error = v06Friendly(e) }
                        finally { loading = false }
                    }
                }
            },
            enabled = !loading,
            modifier = Modifier.fillMaxWidth().height(52.dp)
        ) { Text(if (loading) "Enviando..." else "Enviar cadastro") }
    }
}

@Composable
private fun V06Analysis(pending:Triple<String,String,String>?,onBack:()->Unit,onActivation:()->Unit) {
    val scope = rememberCoroutineScope()
    var state by remember { mutableStateOf<ApplicationStatus?>(null) }
    var loading by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    fun refresh() {
        if (pending == null) return
        loading = true
        scope.launch {
            try { state = SupabaseApi.checkApplication(pending.first,pending.second); error = null }
            catch (e:Exception) { error = v06Friendly(e) }
            finally { loading = false }
        }
    }
    LaunchedEffect(pending?.first) { refresh() }

    V06Page("Análise", pending?.third ?: "Solicitação", onBack) {
        if (pending == null) {
            V06Error("Não há cadastro salvo neste aparelho.")
            return@V06Page
        }
        V06Step("1", "Cadastro", "Concluído", PSuccess)
        V06Step("2", "Open Finance", if (state?.openFinanceStatus == "connected") "Conectado" else "Pendente", if (state?.openFinanceStatus == "connected") PSuccess else PWarning)
        V06Step("3", "Análise manual", when(state?.status){"approved","activation_sent","active"->"Aprovado";"rejected"->"Não aprovado";else->"Aguardando"}, when(state?.status){"approved","activation_sent","active"->PSuccess;"rejected"->PDanger;else->PWarning})
        V06Step("4", "Ativação", when(state?.status){"activation_sent"->"Código enviado";"active"->"Ativa";else->"Pendente"}, if(state?.status=="active") PSuccess else PMuted)
        when (state?.status) {
            "approved" -> V06Info("Cadastro aprovado", "Aguarde o envio do código de acesso pelo Admin.")
            "activation_sent" -> {
                V06Success("Código enviado", "Confira seu e-mail e informe os 6 dígitos.")
                state?.approvedLimit?.let { V06Info("Limite aprovado", v06Brl(it)) }
                V06Primary("Inserir código", onActivation)
            }
            "active" -> V06Success("Conta ativa", "Sua conta já foi ativada.")
            "rejected" -> V06Error("A solicitação não foi aprovada.")
            else -> V06Info("Em análise", "Você ainda não tem acesso à área de crédito até a aprovação manual.")
        }
        error?.let { V06Error(it) }
        V06Secondary(if (loading) "Atualizando..." else "Atualizar status") { if (!loading) refresh() }
    }
}

@Composable
private fun V06Activation(email:String,onBack:()->Unit,onVerified:(Session)->Unit) {
    val scope = rememberCoroutineScope()
    var code by remember { mutableStateOf("") }
    var loading by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    V06Page("Código de acesso", email, onBack) {
        V06Info("Conta aprovada", "Digite o código de 6 dígitos recebido por e-mail.")
        V06Field("Código", code, KeyboardType.Number) { code = it.filter(Char::isDigit).take(6) }
        error?.let { V06Error(it) }
        Button(
            onClick = {
                loading = true
                scope.launch {
                    try { onVerified(SupabaseApi.verifyEmailOtp(email,code)) }
                    catch (e:Exception) { error = v06Friendly(e) }
                    finally { loading = false }
                }
            },
            enabled = code.length == 6 && !loading,
            modifier = Modifier.fillMaxWidth().height(52.dp)
        ) { Text(if (loading) "Validando..." else "Validar código") }
    }
}

@Composable
private fun V06CreatePassword(session:Session?,onDone:(Session)->Unit,onCancel:()->Unit) {
    val scope = rememberCoroutineScope()
    var pass by remember { mutableStateOf("") }
    var confirm by remember { mutableStateOf("") }
    var loading by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    V06Page("Crie sua senha", session?.email.orEmpty(), null) {
        V06Info("Última etapa", "Depois da senha, a conta abre com o limite que foi aprovado no Admin.")
        V06Password("Senha", pass) { pass = it }
        V06Password("Confirmar senha", confirm) { confirm = it }
        error?.let { V06Error(it) }
        Button(
            onClick = {
                val s = session ?: return@Button
                loading = true
                scope.launch {
                    try {
                        SupabaseApi.setPassword(s.accessToken,pass)
                        SupabaseApi.completeActivation(s.accessToken)
                        val refreshed = if (s.refreshToken.isNotBlank()) SupabaseApi.refreshSession(s.refreshToken) else s.copy(activationRequired=false)
                        onDone(refreshed)
                    } catch (e:Exception) { error = v06Friendly(e) }
                    finally { loading = false }
                }
            },
            enabled = !loading && pass.length >= 8 && pass == confirm && session != null,
            modifier = Modifier.fillMaxWidth().height(52.dp)
        ) { Text(if (loading) "Ativando..." else "Criar senha e entrar") }
        TextButton(onClick = onCancel, modifier = Modifier.fillMaxWidth()) { Text("Cancelar") }
    }
}

@Composable
private fun V06Login(onBack:()->Unit,onLogin:(Session)->Unit) {
    val scope = rememberCoroutineScope()
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var loading by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    V06Page("Acesse sua conta", "Login CrediFlow", onBack) {
        V06Logo()
        Spacer(Modifier.height(18.dp))
        V06Field("E-mail", email, KeyboardType.Email) { email = it }
        V06Password("Senha", password) { password = it }
        error?.let { V06Error(it) }
        V06Primary(if (loading) "Entrando..." else "Entrar") {
            if (!loading) {
                loading = true
                scope.launch {
                    try { onLogin(SupabaseApi.signIn(email,password)) }
                    catch (e:Exception) { error = v06Friendly(e) }
                    finally { loading = false }
                }
            }
        }
        Spacer(Modifier.height(10.dp))
        Text("O perfil Admin é identificado automaticamente pela conta.", color = PMuted, fontSize = 12.sp)
    }
}

@Composable
private fun V06Home(session:Session?,onLoan:()->Unit,onProfile:()->Unit,onLogout:()->Unit) {
    val scope = rememberCoroutineScope()
    var home by remember { mutableStateOf<ClientHome?>(null) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    fun load() {
        val token = session?.accessToken ?: return
        loading = true
        scope.launch {
            try { home = SupabaseApi.loadClientHome(token); error = null }
            catch (e:Exception) { error = v06Friendly(e) }
            finally { loading = false }
        }
    }
    LaunchedEffect(session?.accessToken) { load() }

    V06Page("Olá, ${home?.displayName ?: "cliente"}", "Sua conta CrediFlow", null) {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) {
            TextButton(onClick = onProfile) { Text("Perfil e segurança") }
        }
        if (loading && home == null) LinearProgressIndicator(Modifier.fillMaxWidth())
        home?.let { h ->
            val available = (h.limitAmount - h.usedLimit).coerceAtLeast(0.0)
            Card(
                colors = CardDefaults.cardColors(containerColor = PSurfaceAlt),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(Modifier.padding(20.dp)) {
                    Text("Limite disponível", color = PMuted, fontSize = 12.sp)
                    Text(v06Brl(available), color = PText, fontSize = 36.sp, fontWeight = FontWeight.Black)
                    Spacer(Modifier.height(10.dp))
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("Total ${v06Brl(h.limitAmount)}", color = PMuted, fontSize = 12.sp)
                        Text("Em uso ${v06Brl(h.usedLimit)}", color = PMuted, fontSize = 12.sp)
                    }
                }
            }
            Spacer(Modifier.height(14.dp))
            V06Primary("Solicitar empréstimo", onLoan)
            V06Section("Condições aprovadas")
            V06Two("Parcelas", "até ${h.maxInstallments}x", "Taxa", h.monthlyRate?.let { "${v06Pct(it*100)}% a.m." } ?: "—")
            V06Section("Empréstimos")
            if (h.loans.isEmpty()) V06Info("Nenhuma operação ativa", "Quando houver empréstimos, eles aparecerão aqui.")
            else h.loans.forEach { V06Info(v06Brl(it.principal), "${it.installments}x · ${it.status}") }
        }
        error?.let { V06Error(it) }
        V06Secondary("Atualizar") { load() }
        TextButton(onClick = onLogout, modifier = Modifier.fillMaxWidth()) { Text("Sair da conta") }
    }
}

@Composable
private fun V06Loan(session:Session?,onBack:()->Unit) {
    var home by remember { mutableStateOf<ClientHome?>(null) }
    var amount by remember { mutableStateOf("") }
    var installments by remember { mutableIntStateOf(1) }
    var pixType by remember { mutableStateOf("CPF") }
    var pixKey by remember { mutableStateOf("") }
    var reachedSummary by remember { mutableStateOf(false) }

    LaunchedEffect(session?.accessToken) {
        session?.accessToken?.let { runCatching { home = SupabaseApi.loadClientHome(it) } }
    }

    V06Page("Solicitar empréstimo", "Use apenas o limite já aprovado", onBack) {
        val h = home
        val available = ((h?.limitAmount ?: 0.0) - (h?.usedLimit ?: 0.0)).coerceAtLeast(0.0)
        V06Info("Limite disponível", v06Brl(available))
        V06Field("Valor desejado", amount, KeyboardType.Decimal) { amount = it }
        V06Section("Parcelas disponíveis")
        Row(horizontalArrangement = Arrangement.spacedBy(7.dp)) {
            (1..(h?.maxInstallments?.coerceIn(1,4) ?: 1)).forEach { n ->
                FilterChip(selected = installments == n, onClick = { installments = n }, label = { Text("${n}x") })
            }
        }
        V06Section("Conta para receber")
        Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            listOf("CPF","Celular","E-mail").forEach { t ->
                FilterChip(selected = pixType == t, onClick = { pixType = t }, label = { Text(t, fontSize = 11.sp) })
            }
        }
        V06Field("Chave Pix", pixKey) { pixKey = it }
        val principal = amount.replace(",", ".").toDoubleOrNull() ?: 0.0
        val rate = h?.monthlyRate ?: 0.0
        if (principal > 0) {
            V06Info("Resumo", "Valor ${v06Brl(principal)} · ${installments}x · total estimado ${v06Brl(principal*(1+rate*installments))}. O contrato definitivo deverá exibir CET e condições.")
        }
        Button(
            onClick = { reachedSummary = true },
            enabled = principal > 0 && principal <= available && pixKey.isNotBlank(),
            modifier = Modifier.fillMaxWidth().height(52.dp)
        ) { Text("Continuar") }
        if (reachedSummary) {
            V06Info("Pronto para integração", "A 0.7 monta a solicitação, mas a liberação Pix real continua bloqueada até conectar o parceiro financeiro autorizado.")
        }
    }
}

@Composable
private fun V06Profile(session:Session?,onBack:()->Unit,onLogout:()->Unit) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var profile by remember { mutableStateOf<ProfileSettings?>(null) }
    var displayName by remember { mutableStateOf("") }
    var avatarBitmap by remember { mutableStateOf<Bitmap?>(null) }
    var loading by remember { mutableStateOf(true) }
    var saving by remember { mutableStateOf(false) }
    var message by remember { mutableStateOf<String?>(null) }
    var error by remember { mutableStateOf<String?>(null) }
    var pass by remember { mutableStateOf("") }
    var confirm by remember { mutableStateOf("") }

    fun loadProfile() {
        val token = session?.accessToken ?: return
        loading = true
        scope.launch {
            try {
                val p = SupabaseApi.loadProfileSettings(token)
                profile = p
                displayName = p.displayName
                val url = SupabaseApi.avatarPublicUrl(p.avatarPath)
                avatarBitmap = if (url != null) withContext(Dispatchers.IO) { runCatching { URL(url).openStream().use(BitmapFactory::decodeStream) }.getOrNull() } else null
                error = null
            } catch (e:Exception) { error = v06Friendly(e) }
            finally { loading = false }
        }
    }

    val picker = rememberLauncherForActivityResult(ActivityResultContracts.GetContent()) { uri ->
        if (uri == null || session == null || session.userId.isBlank()) return@rememberLauncherForActivityResult
        scope.launch {
            saving = true; message = null; error = null
            try {
                val mime = context.contentResolver.getType(uri) ?: "image/jpeg"
                val bytes = withContext(Dispatchers.IO) { context.contentResolver.openInputStream(uri)?.use { it.readBytes() } ?: error("Falha ao ler imagem") }
                if (bytes.size > 5 * 1024 * 1024) error("Escolha uma imagem de até 5 MB")
                SupabaseApi.uploadAvatar(session.accessToken,session.userId,bytes,mime)
                message = "Foto de perfil atualizada."
                loadProfile()
            } catch (e:Exception) { error = v06Friendly(e) }
            finally { saving = false }
        }
    }

    LaunchedEffect(session?.accessToken) { loadProfile() }

    V06Page("Perfil e segurança", "Controle da sua conta", onBack) {
        if (loading && profile == null) LinearProgressIndicator(Modifier.fillMaxWidth())
        profile?.let { p ->
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    Modifier.size(84.dp).clip(CircleShape).background(PBlue.copy(alpha=.18f)),
                    contentAlignment = Alignment.Center
                ) {
                    val bmp = avatarBitmap
                    if (bmp != null) Image(bmp.asImageBitmap(), null, Modifier.fillMaxSize(), contentScale = ContentScale.Crop)
                    else Text((displayName.ifBlank { p.fullName }).take(1).uppercase(), color = PBlueSoft, fontSize = 30.sp, fontWeight = FontWeight.Black)
                }
                Spacer(Modifier.width(16.dp))
                Column {
                    Text(displayName.ifBlank { p.fullName }, fontSize = 22.sp, fontWeight = FontWeight.Bold)
                    TextButton(onClick = { picker.launch("image/*") }, enabled = !saving) { Text(if (saving) "Enviando..." else "Alterar foto") }
                }
            }
            V06Section("Como você quer ser chamado")
            V06Field("Nome de exibição", displayName) { displayName = it.take(40) }
            V06Primary("Salvar nome") {
                if (session == null || session.userId.isBlank()) {
                    error = "Sessão precisa ser renovada antes de alterar o perfil."
                } else if (displayName.trim().length < 2) {
                    error = "Informe pelo menos 2 caracteres."
                } else {
                    saving = true; message = null; error = null
                    scope.launch {
                        try {
                            SupabaseApi.updateDisplayName(session.accessToken,session.userId,displayName)
                            message = "Nome de exibição atualizado."
                            loadProfile()
                        } catch (e:Exception) { error = v06Friendly(e) }
                        finally { saving = false }
                    }
                }
            }
            V06Section("Dados verificados")
            V06Locked("Nome civil", p.fullName)
            V06Locked("CPF", if (p.cpfLast4.isBlank()) "Protegido" else "•••.•••.•••-${p.cpfLast4}")
            V06Locked("E-mail", p.email)
            V06Locked("Celular", p.phone.ifBlank { "Não informado" })
            Text("Campos de identidade não podem ser alterados diretamente no app.", color = PMuted, fontSize = 12.sp)

            V06Section("Alterar senha")
            V06Password("Nova senha", pass) { pass = it }
            V06Password("Confirmar nova senha", confirm) { confirm = it }
            OutlinedButton(
                onClick = {
                    if (session == null) return@OutlinedButton
                    if (pass.length < 8 || pass != confirm) {
                        error = "A senha precisa ter 8 ou mais caracteres e as duas devem coincidir."
                    } else {
                        saving = true; message = null; error = null
                        scope.launch {
                            try {
                                val audit = SupabaseApi.changePassword(session.accessToken,pass)
                                pass = ""; confirm = ""
                                message = if (audit) "Senha alterada e registrada no histórico de segurança." else "Senha alterada; o registro de auditoria ficou pendente."
                            } catch (e:Exception) { error = v06Friendly(e) }
                            finally { saving = false }
                        }
                    }
                },
                enabled = !saving,
                modifier = Modifier.fillMaxWidth().height(50.dp)
            ) { Text("Alterar senha") }
        }
        message?.let { V06Success("Concluído", it) }
        error?.let { V06Error(it) }
        Spacer(Modifier.height(10.dp))
        TextButton(onClick = onLogout, modifier = Modifier.fillMaxWidth()) { Text("Sair da conta", color = PDanger) }
    }
}

@Composable
private fun V06Admin(session:Session?,onSelect:(AdminApplication)->Unit,onAudit:()->Unit,onLogout:()->Unit) {
    val scope = rememberCoroutineScope()
    var apps by remember { mutableStateOf<List<AdminApplication>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    fun load() {
        val token = session?.accessToken ?: return
        loading = true
        scope.launch {
            try { apps = SupabaseApi.listApplications(token); error = null }
            catch (e:Exception) { error = v06Friendly(e) }
            finally { loading = false }
        }
    }
    LaunchedEffect(session?.accessToken) { load() }

    V06Page("Painel Admin", "Visão geral da operação", null) {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            V06Stat("Cadastros", apps.size.toString(), Modifier.weight(1f))
            V06Stat("Em análise", apps.count { it.status !in setOf("active","rejected") }.toString(), Modifier.weight(1f))
        }
        Spacer(Modifier.height(8.dp))
        V06Secondary("Histórico de auditoria", onAudit)
        Spacer(Modifier.height(12.dp))
        V06Info("Regra da análise", "O Admin consulta os dados e define manualmente limite, taxa e parcelas. O app não toma sozinho a decisão de crédito.")
        V06Section("Análises")
        if (loading) LinearProgressIndicator(Modifier.fillMaxWidth())
        error?.let { V06Error(it) }
        if (!loading && apps.isEmpty()) V06Info("Sem solicitações", "Novos cadastros aparecerão aqui.")
        apps.forEach { a ->
            Card(
                modifier = Modifier.fillMaxWidth().padding(bottom = 9.dp).clickable { onSelect(a) },
                colors = CardDefaults.cardColors(containerColor = PSurface)
            ) {
                Column(Modifier.padding(15.dp)) {
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text(a.fullName, fontWeight = FontWeight.Bold)
                        V06Pill(a.status)
                    }
                    Text(a.email, color = PMuted, fontSize = 12.sp)
                    Text("Open Finance: ${a.openFinanceStatus}", color = if(a.openFinanceStatus=="connected") PSuccess else PWarning, fontSize = 12.sp)
                }
            }
        }
        V06Secondary("Atualizar lista") { load() }
        TextButton(onClick = onLogout, modifier = Modifier.fillMaxWidth()) { Text("Sair do Admin") }
    }
}

@Composable
private fun V06AdminDetail(session:Session?,application:AdminApplication?,onBack:()->Unit,onUpdated:()->Unit) {
    val scope = rememberCoroutineScope()
    var limit by remember { mutableStateOf(application?.approvedLimit?.toString() ?: "50") }
    var tier by remember { mutableStateOf(application?.approvedRiskTier ?: "novo") }
    var rate by remember { mutableStateOf(application?.approvedMonthlyRate?.let { (it*100).toString() } ?: "4") }
    var installments by remember { mutableStateOf(application?.approvedMaxInstallments?.toString() ?: "1") }
    var notes by remember { mutableStateOf("") }
    var loading by remember { mutableStateOf(false) }
    var message by remember { mutableStateOf<String?>(null) }
    var error by remember { mutableStateOf<String?>(null) }

    V06Page("Análise do cliente", application?.fullName ?: "Cadastro", onBack) {
        val a = application
        val token = session?.accessToken
        if (a == null || token == null) {
            V06Error("Cadastro ou sessão Admin indisponível.")
            return@V06Page
        }
        V06Two("CPF", v06MaskCpf(a.cpf), "Nascimento", a.birthDate)
        V06Two("Cidade", "${a.city}/${a.state}", "Renda", a.monthlyIncome?.let(::v06Brl) ?: "—")
        V06Two("Profissão", a.occupation.ifBlank { "—" }, "Open Finance", a.openFinanceStatus)
        if (a.openFinanceStatus != "connected") V06Info("Open Finance pendente", "Não há dados bancários conectados nesta etapa.")
        V06Section("Decisão manual")
        V06Field("Limite aprovado (R$)", limit, KeyboardType.Decimal) { limit = it }
        V06Field("Faixa interna", tier) { tier = it }
        V06Field("Juros mensais (%)", rate, KeyboardType.Decimal) { rate = it }
        V06Field("Máximo de parcelas", installments, KeyboardType.Number) { installments = it }
        V06Field("Observações", notes) { notes = it }
        message?.let { V06Success("Concluído", it) }
        error?.let { V06Error(it) }
        Button(
            onClick = {
                val l = limit.replace(",", ".").toDoubleOrNull()
                val r = rate.replace(",", ".").toDoubleOrNull()
                val n = installments.toIntOrNull()
                if (l == null || l <= 0 || r == null || r < 0 || n == null || n < 1) error = "Revise limite, juros e parcelas."
                else {
                    loading = true; error = null; message = null
                    scope.launch {
                        try { SupabaseApi.recordReview(token,a.id,"approved",l,tier,r/100,n,notes); message = "Cadastro aprovado. Agora envie o código de acesso." }
                        catch (e:Exception) { error = v06Friendly(e) }
                        finally { loading = false }
                    }
                }
            },
            enabled = !loading,
            modifier = Modifier.fillMaxWidth().height(52.dp)
        ) { Text(if (loading) "Salvando..." else "Aprovar condições") }
        Spacer(Modifier.height(8.dp))
        OutlinedButton(
            onClick = {
                loading = true; error = null; message = null
                scope.launch {
                    try { SupabaseApi.sendActivation(token,a.id); message = "Código de acesso solicitado ao serviço de e-mail." }
                    catch (e:Exception) { error = v06Friendly(e) }
                    finally { loading = false }
                }
            },
            enabled = !loading,
            modifier = Modifier.fillMaxWidth().height(50.dp)
        ) { Text("Enviar código de acesso") }
        TextButton(
            onClick = {
                loading = true
                scope.launch {
                    try { SupabaseApi.recordReview(token,a.id,"rejected",null,null,null,null,notes); onUpdated() }
                    catch (e:Exception) { error = v06Friendly(e) }
                    finally { loading = false }
                }
            },
            enabled = !loading,
            modifier = Modifier.fillMaxWidth()
        ) { Text("Não aprovar", color = PDanger) }
    }
}

@Composable
private fun V06AdminAudit(session:Session?,onBack:()->Unit) {
    val scope = rememberCoroutineScope()
    var entries by remember { mutableStateOf<List<AuditEntry>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    fun load() {
        val token = session?.accessToken ?: return
        loading = true
        scope.launch {
            try { entries = SupabaseApi.listAudit(token); error = null }
            catch (e:Exception) { error = v06Friendly(e) }
            finally { loading = false }
        }
    }
    LaunchedEffect(session?.accessToken) { load() }

    V06Page("Auditoria", "Quem alterou, o quê e quando", onBack) {
        V06Info("Histórico de segurança", "Alterações de perfil e senha ficam registradas. Senhas nunca são armazenadas no histórico.")
        if (loading) LinearProgressIndicator(Modifier.fillMaxWidth())
        error?.let { V06Error(it) }
        if (!loading && entries.isEmpty()) V06Info("Sem eventos", "Ainda não há alterações registradas.")
        entries.forEach { e ->
            Card(colors = CardDefaults.cardColors(containerColor = PSurface), modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp)) {
                Column(Modifier.padding(14.dp)) {
                    Text(v06ActionLabel(e.action), fontWeight = FontWeight.Bold)
                    Text(e.createdAt.replace("T"," ").take(19), color = PMuted, fontSize = 11.sp)
                    Text("Usuário: ${e.actorUserId?.take(8) ?: "sistema"}", color = PMuted, fontSize = 11.sp)
                    if (e.action == "profile_updated") Text(v06AuditSummary(e.details), color = PText, fontSize = 12.sp, modifier = Modifier.padding(top = 6.dp))
                }
            }
        }
        V06Secondary("Atualizar") { load() }
    }
}

@Composable
private fun V06Page(title:String,subtitle:String,onBack:(()->Unit)?,content:@Composable ColumnScope.()->Unit) {
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(18.dp)) {
        if (onBack != null) TextButton(onClick = onBack, contentPadding = PaddingValues(0.dp)) { Text("← Voltar") }
        Text(title, color = PText, fontSize = 29.sp, fontWeight = FontWeight.Black)
        if (subtitle.isNotBlank()) Text(subtitle, color = PMuted, fontSize = 13.sp)
        Spacer(Modifier.height(18.dp))
        content()
        Spacer(Modifier.height(28.dp))
        HorizontalDivider(color = PSurfaceAlt)
        Spacer(Modifier.height(10.dp))
        Text("CrediFlow · 0.8 · Professional", color = PMuted, fontSize = 10.sp)
    }
}

@Composable private fun V06Logo() {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Box(Modifier.size(58.dp).background(PBlue, RoundedCornerShape(18.dp)), contentAlignment = Alignment.Center) {
            Text("C", color = Color.White, fontSize = 29.sp, fontWeight = FontWeight.Black)
        }
        Spacer(Modifier.width(12.dp))
        Column { Text("CrediFlow", fontSize = 24.sp, fontWeight = FontWeight.Black); Text("Crédito que impulsiona você", color = PMuted, fontSize = 11.sp) }
    }
}
@Composable private fun V06Field(label:String,value:String,type:KeyboardType=KeyboardType.Text,onChange:(String)->Unit) { OutlinedTextField(value,onChange,label={Text(label)},keyboardOptions=KeyboardOptions(keyboardType=type),singleLine=true,modifier=Modifier.fillMaxWidth().padding(bottom=8.dp)) }
@Composable private fun V06Password(label:String,value:String,onChange:(String)->Unit) { OutlinedTextField(value,onChange,label={Text(label)},visualTransformation=PasswordVisualTransformation(),singleLine=true,modifier=Modifier.fillMaxWidth().padding(bottom=8.dp)) }
@Composable private fun V06Primary(label:String,onClick:()->Unit) { Button(onClick=onClick,modifier=Modifier.fillMaxWidth().height(52.dp)){Text(label,fontWeight=FontWeight.Bold)} }
@Composable private fun V06Secondary(label:String,onClick:()->Unit) { OutlinedButton(onClick=onClick,modifier=Modifier.fillMaxWidth().height(50.dp)){Text(label)} }
@Composable private fun V06Section(title:String) { Text(title, fontSize=18.sp, fontWeight=FontWeight.Bold, modifier=Modifier.padding(top=14.dp,bottom=9.dp)) }
@Composable private fun V06Info(title:String,body:String) { Card(colors=CardDefaults.cardColors(containerColor=PSurface),modifier=Modifier.fillMaxWidth().padding(bottom=10.dp)){Column(Modifier.padding(15.dp)){Text(title,fontWeight=FontWeight.Bold);Text(body,color=PMuted,fontSize=12.sp,lineHeight=17.sp)}} }
@Composable private fun V06Success(title:String,body:String) { Card(colors=CardDefaults.cardColors(containerColor=Color(0xFF0D2D26)),modifier=Modifier.fillMaxWidth().padding(bottom=10.dp)){Column(Modifier.padding(15.dp)){Text(title,color=PSuccess,fontWeight=FontWeight.Bold);Text(body,color=Color(0xFFD8F7E8),fontSize=12.sp,lineHeight=17.sp)}} }
@Composable private fun V06Error(body:String) { Card(colors=CardDefaults.cardColors(containerColor=Color(0xFF331923)),modifier=Modifier.fillMaxWidth().padding(bottom=10.dp)){Text(body,color=Color(0xFFFFC0C8),fontSize=12.sp,modifier=Modifier.padding(15.dp))} }
@Composable private fun V06Locked(label:String,value:String) { Card(colors=CardDefaults.cardColors(containerColor=PSurface),modifier=Modifier.fillMaxWidth().padding(bottom=8.dp)){Column(Modifier.padding(13.dp)){Text(label,color=PMuted,fontSize=10.sp);Text(value,fontWeight=FontWeight.SemiBold);Text("Verificado · bloqueado para edição direta",color=PMuted,fontSize=10.sp)}} }
@Composable private fun V06Step(n:String,title:String,status:String,color:Color) { Row(Modifier.fillMaxWidth().padding(vertical=7.dp),verticalAlignment=Alignment.CenterVertically){Box(Modifier.size(35.dp).background(color.copy(alpha=.16f),RoundedCornerShape(11.dp)),contentAlignment=Alignment.Center){Text(n,color=color,fontWeight=FontWeight.Black)};Spacer(Modifier.width(12.dp));Column{Text(title,fontWeight=FontWeight.SemiBold);Text(status,color=color,fontSize=12.sp)}} }
@Composable private fun V06Two(t1:String,v1:String,t2:String,v2:String) { Row(Modifier.fillMaxWidth().padding(bottom=8.dp),horizontalArrangement=Arrangement.spacedBy(8.dp)){listOf(t1 to v1,t2 to v2).forEach{(t,v)->Card(colors=CardDefaults.cardColors(containerColor=PSurface),modifier=Modifier.weight(1f)){Column(Modifier.padding(12.dp)){Text(t,color=PMuted,fontSize=10.sp);Text(v,fontWeight=FontWeight.Bold,fontSize=13.sp)}}}} }
@Composable private fun V06Pill(status:String) { val c=when(status){"approved","activation_sent","active"->PSuccess;"rejected"->PDanger;else->PWarning};Surface(color=c.copy(alpha=.15f),shape=RoundedCornerShape(99.dp)){Text(status,color=c,fontSize=10.sp,modifier=Modifier.padding(horizontal=9.dp,vertical=5.dp))} }
@Composable private fun V06Stat(label:String,value:String,modifier:Modifier=Modifier) { Card(colors=CardDefaults.cardColors(containerColor=PSurfaceAlt),modifier=modifier){Column(Modifier.padding(14.dp)){Text(label,color=PMuted,fontSize=11.sp);Text(value,fontSize=24.sp,fontWeight=FontWeight.Black)}} }

private fun v06Brl(value:Double)=NumberFormat.getCurrencyInstance(Locale("pt","BR")).format(value)
private fun v06Pct(value:Double)=String.format(Locale.US,"%.2f",value).replace(".",",")
private fun v06MaskCpf(cpf:String):String{val d=cpf.filter(Char::isDigit);return if(d.length==11)"***.${d.substring(3,6)}.${d.substring(6,9)}-**" else "Protegido"}
private fun v06ActionLabel(action:String)=when(action){"profile_updated"->"Perfil alterado";"password_changed"->"Senha alterada";"credit_review_recorded"->"Análise de crédito registrada";else->action.replace("_"," ").replaceFirstChar{it.uppercase()}}
private fun v06AuditSummary(details:String):String = when {
    details.contains("display_name") && details.contains("avatar_path") -> "Nome de exibição e foto de perfil alterados."
    details.contains("display_name") -> "Nome de exibição alterado."
    details.contains("avatar_path") -> "Foto de perfil alterada."
    else -> "Alteração registrada."
}
private fun v06Friendly(e:Exception):String{val raw=e.message?:"Erro inesperado";return when{raw.contains("application_already_exists",true)->"Já existe um cadastro em análise para este CPF.";raw.contains("invalid_email",true)->"E-mail inválido.";raw.contains("minimum_age_18",true)->"O cadastro exige idade mínima de 18 anos.";raw.contains("invalid_cpf",true)->"CPF inválido.";raw.contains("invalid_credentials",true)||raw.contains("Invalid login",true)->"E-mail ou senha incorretos.";raw.contains("password_too_short",true)->"A senha precisa ter pelo menos 8 caracteres.";raw.contains("Email address not authorized",true)->"O SMTP ainda não está configurado para clientes externos.";raw.contains("otp_send_failed",true)->"Não foi possível enviar o código. Verifique o SMTP do Supabase.";else->raw.replace("_"," ")}}
