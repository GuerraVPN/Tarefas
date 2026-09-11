from pathlib import Path

MAIN=Path('crediflow-android/app/src/main/java/br/com/guerravpn/crediflow/MainActivity.kt')
API=Path('crediflow-android/app/src/main/java/br/com/guerravpn/crediflow/Api.kt')

def once(s, old, new, label):
    if old not in s:
        raise SystemExit(f'missing target: {label}')
    return s.replace(old,new,1)

main=MAIN.read_text()
api=API.read_text()

# API data models
api=once(api,
'''data class LoanSummary(
    val id: String,
    val principal: Double,
    val totalAmount: Double,
    val installments: Int,
    val status: String,
    val requestedAt: String
)
''',
'''data class LoanSummary(
    val id: String,
    val principal: Double,
    val totalAmount: Double,
    val installments: Int,
    val status: String,
    val requestedAt: String
)

data class LoanPreview(
    val available: Double,
    val amount: Double,
    val monthlyRate: Double,
    val installments: Int,
    val installmentValue: Double,
    val total: Double,
    val contractVersion: String,
    val contractBody: String
)

data class LoanRequestResult(
    val loanId: String,
    val status: String,
    val contractNumber: String,
    val total: Double
)

data class AdminLoanRequest(
    val id: String,
    val fullName: String,
    val email: String,
    val principal: Double,
    val totalAmount: Double,
    val monthlyRate: Double,
    val installments: Int,
    val status: String,
    val requestedAt: String,
    val pixType: String,
    val pixMasked: String,
    val pixValue: String,
    val contractNumber: String,
    val readingChoice: String
)
''','loan api models')

# API methods before loadClientHome
api=once(api,
'''    suspend fun loadClientHome(access: String): ClientHome {
''',
'''    suspend fun previewLoan(access: String, amount: Double, installments: Int): LoanPreview {
        val r = JSONObject(
            request(
                "POST",
                "/functions/v1/client-loan-preview",
                JSONObject().put("amount", amount).put("installments", installments),
                access
            )
        )
        return LoanPreview(
            available = r.optDouble("available"),
            amount = r.optDouble("amount"),
            monthlyRate = r.optDouble("monthlyRate"),
            installments = r.optInt("installments"),
            installmentValue = r.optDouble("installmentValue"),
            total = r.optDouble("total"),
            contractVersion = r.optString("contractVersion"),
            contractBody = r.optString("contractBody")
        )
    }

    suspend fun submitLoanRequest(
        access: String,
        amount: Double,
        installments: Int,
        pixKeyType: String,
        pixKey: String,
        readingChoice: String
    ): LoanRequestResult {
        val r = JSONObject(
            request(
                "POST",
                "/functions/v1/client-loan-request",
                JSONObject()
                    .put("amount", amount)
                    .put("installments", installments)
                    .put("pixKeyType", pixKeyType)
                    .put("pixKey", pixKey)
                    .put("repaymentMethod", "pix")
                    .put("readingChoice", readingChoice),
                access
            )
        )
        return LoanRequestResult(
            loanId = r.optString("loanId"),
            status = r.optString("status"),
            contractNumber = r.optString("contractNumber"),
            total = r.optDouble("total")
        )
    }

    suspend fun listAdminLoanRequests(access: String): List<AdminLoanRequest> {
        val root = JSONObject(request("GET", "/functions/v1/admin-loan-requests", accessToken = access))
        val a = root.optJSONArray("items") ?: JSONArray()
        return (0 until a.length()).map { i ->
            val j = a.getJSONObject(i)
            val p = j.optJSONObject("profile") ?: JSONObject()
            val pix = j.optJSONObject("pix") ?: JSONObject()
            val c = j.optJSONObject("contract") ?: JSONObject()
            AdminLoanRequest(
                id = j.optString("id"),
                fullName = p.optString("full_name", "Cliente"),
                email = p.optString("email"),
                principal = j.optDouble("principal"),
                totalAmount = j.optDouble("total_amount"),
                monthlyRate = j.optDouble("monthly_interest_rate"),
                installments = j.optInt("installments_count"),
                status = j.optString("status"),
                requestedAt = j.optString("requested_at"),
                pixType = pix.optString("key_type"),
                pixMasked = pix.optString("key_masked"),
                pixValue = pix.optString("key_value"),
                contractNumber = c.optString("contract_number"),
                readingChoice = c.optString("reading_choice")
            )
        }
    }

    suspend fun confirmManualDisbursement(access: String, loanId: String, note: String) {
        request(
            "POST",
            "/functions/v1/admin-confirm-disbursement",
            JSONObject().put("loanId", loanId).put("note", note),
            access
        )
    }

    suspend fun rejectLoanRequest(access: String, loanId: String, note: String) {
        request(
            "POST",
            "/functions/v1/admin-reject-loan-request",
            JSONObject().put("loanId", loanId).put("note", note),
            access
        )
    }

    suspend fun loadClientHome(access: String): ClientHome {
''','loan API methods')

# Screen enum
main=once(main,
'''    WELCOME, REGISTER, DOCUMENTS, ANALYSIS, CORRECTION, ACTIVATE, LOGIN, HOME, ADMIN, ADMIN_DETAIL
''',
'''    WELCOME, REGISTER, DOCUMENTS, ANALYSIS, CORRECTION, ACTIVATE, LOGIN, HOME, LOAN_REQUEST, ADMIN, ADMIN_DETAIL
''','loan request screen enum')

# HOME navigation and screen
main=once(main,
'''            Screen.HOME -> HomeScreen(
                session = session,
                onLogout = {
                    store.clearSession()
                    session = null
                    screen = Screen.WELCOME
                }
            )

            Screen.ADMIN -> AdminScreen(
''',
'''            Screen.HOME -> HomeScreen(
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
''','home navigation')

# Replace HomeScreen and AdminScreen block up to AdminDetailScreen
start=main.index('@Composable\nprivate fun HomeScreen(')
end=main.index('@Composable\nprivate fun AdminDetailScreen(', start)
replacement=r'''@Composable
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

'''
main=main[:start]+replacement+main[end:]

# friendly messages
main=once(main,
'''        raw.contains("weak_password") -> "Senha fraca. Use 10+ caracteres com maiúscula, minúscula e número."
        raw.contains("forbidden") -> "Acesso não autorizado."
''',
'''        raw.contains("weak_password") -> "Senha fraca. Use 10+ caracteres com maiúscula, minúscula e número."
        raw.contains("amount_exceeds_available_limit") -> "O valor solicitado ultrapassa o limite disponível."
        raw.contains("installments_exceed_policy") -> "A quantidade de parcelas ultrapassa o permitido para sua conta."
        raw.contains("invalid_pix_key") -> "Informe uma chave Pix válida para receber o valor."
        raw.contains("card_provider_not_configured") -> "Pagamento por cartão ainda não está disponível."
        raw.contains("account_not_active") -> "Sua conta ainda não está ativa para solicitar crédito."
        raw.contains("active_limit_not_found") -> "Não encontramos um limite ativo para sua conta."
        raw.contains("forbidden") -> "Acesso não autorizado."
''','loan friendly errors')

# helpers before verificationLabel
main=once(main,
'''private fun verificationLabel(level: String?): String = when (level) {
''',
'''private fun loanStatusLabel(status: String): String = when (status) {
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
''','loan helpers')

MAIN.write_text(main)
API.write_text(api)
print('Loan request/admin Pix flow patch applied')
