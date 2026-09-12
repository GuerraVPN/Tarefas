package br.com.guerravpn.crediflow

import android.app.DatePickerDialog
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.launch
import java.text.NumberFormat
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.time.temporal.ChronoUnit
import java.util.Locale
import kotlin.math.round

private val B08 = CrediFlowProfessionalColors.Primary
private val BS08 = CrediFlowProfessionalColors.PrimarySoft
private val BG08 = CrediFlowProfessionalColors.Background
private val S08 = CrediFlowProfessionalColors.Surface
private val SA08 = CrediFlowProfessionalColors.SurfaceAlt
private val T08 = CrediFlowProfessionalColors.TextPrimary
private val M08 = CrediFlowProfessionalColors.TextSecondary
private val OK08 = CrediFlowProfessionalColors.Success
private val W08 = CrediFlowProfessionalColors.Warning
private val D08 = CrediFlowProfessionalColors.Danger

@Composable
fun V08Welcome(hasAnalysis:Boolean,onRegister:()->Unit,onLogin:()->Unit,onAnalysis:()->Unit) {
    Column(Modifier.fillMaxSize().padding(24.dp), verticalArrangement = Arrangement.Center) {
        V08Logo()
        Spacer(Modifier.height(28.dp))
        Text("CREDIFLOW", color = BS08, fontSize = 12.sp, fontWeight = FontWeight.Bold)
        Text("Crédito simples, análise clara.", color = T08, fontSize = 34.sp, lineHeight = 39.sp, fontWeight = FontWeight.Black)
        Spacer(Modifier.height(10.dp))
        Text("Versão 0.8", color = M08, fontSize = 13.sp)
        Spacer(Modifier.height(30.dp))
        V08Primary("Criar cadastro", onRegister)
        Spacer(Modifier.height(10.dp))
        V08Secondary("Entrar na minha conta", onLogin)
        TextButton(onClick = onAnalysis, modifier = Modifier.fillMaxWidth()) { Text("Acompanhar solicitação") }
        Spacer(Modifier.height(18.dp))
        V08Info("Fluxo da conta", "Cadastro → análise manual → aprovação → código por e-mail → criação de senha.")
    }
}

@Composable
fun V08Analysis(pending:Triple<String,String,String>?,onBack:()->Unit,onActivation:()->Unit) {
    val scope = rememberCoroutineScope()
    var state by remember { mutableStateOf<ApplicationStatus?>(null) }
    var loading by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    fun refresh() {
        if (pending == null) return
        loading = true
        scope.launch {
            try { state = SupabaseApi.checkApplication(pending.first,pending.second); error = null }
            catch (e:Exception) { error = v08Friendly(e) }
            finally { loading = false }
        }
    }
    LaunchedEffect(pending?.first) { refresh() }
    V08Page("Análise", pending?.third ?: "Solicitação", onBack) {
        if (pending == null) {
            V08Error("Não há cadastro salvo neste aparelho.")
            return@V08Page
        }
        V08Step("1", "Cadastro", "Concluído", OK08)
        V08Step("2", "Análise manual", when(state?.status){"approved","activation_sent","active"->"Aprovado";"rejected"->"Não aprovado";else->"Aguardando"}, when(state?.status){"approved","activation_sent","active"->OK08;"rejected"->D08;else->W08})
        V08Step("3", "Ativação", when(state?.status){"activation_sent"->"Código enviado";"active"->"Ativa";else->"Pendente"}, if(state?.status=="active") OK08 else M08)
        when (state?.status) {
            "approved" -> V08Info("Cadastro aprovado", "Aguarde o envio do código de acesso pelo Admin.")
            "activation_sent" -> {
                V08Success("Código enviado", "Confira seu e-mail e informe os 6 dígitos.")
                state?.approvedLimit?.let { V08Info("Limite aprovado", v08Brl(it)) }
                V08Primary("Inserir código", onActivation)
            }
            "active" -> V08Success("Conta ativa", "Sua conta já foi ativada.")
            "rejected" -> V08Error("A solicitação não foi aprovada.")
            else -> V08Info("Em análise", "Você ainda não tem acesso à área de crédito até a aprovação manual.")
        }
        error?.let { V08Error(it) }
        V08Secondary(if (loading) "Atualizando..." else "Atualizar status") { if (!loading) refresh() }
    }
}

@Composable
fun V08Loan(session:Session?,onBack:()->Unit) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var home by remember { mutableStateOf<ClientHome?>(null) }
    var lateTerms by remember { mutableStateOf(V08LateTerms(0.0,0.0)) }
    var amount by remember { mutableStateOf("") }
    var installments by remember { mutableIntStateOf(1) }
    var pixType by remember { mutableStateOf("cpf") }
    var pixKey by remember { mutableStateOf("") }
    var firstDue by remember { mutableStateOf<LocalDate?>(null) }
    var loading by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    var result by remember { mutableStateOf<V08LoanRequestResult?>(null) }

    LaunchedEffect(session?.accessToken) {
        session?.accessToken?.let { token ->
            runCatching { home = SupabaseApi.loadClientHome(token) }
            runCatching { lateTerms = LoanApiV08.loadLateTerms(token) }
        }
    }

    V08Page("Solicitar empréstimo", "Escolha valor, vencimento e conta Pix", onBack) {
        val h = home
        val available = ((h?.limitAmount ?: 0.0) - (h?.usedLimit ?: 0.0)).coerceAtLeast(0.0)
        V08Info("Limite disponível", v08Brl(available))
        V08Field("Valor desejado", amount, KeyboardType.Decimal) { amount = it }

        V08Section("Parcelas disponíveis")
        Row(horizontalArrangement = Arrangement.spacedBy(7.dp)) {
            (1..(h?.maxInstallments?.coerceIn(1,6) ?: 1)).forEach { n ->
                FilterChip(selected = installments == n, onClick = { installments = n }, label = { Text("${n}x") })
            }
        }

        V08Section("Primeiro vencimento")
        OutlinedButton(
            onClick = {
                val base = firstDue ?: LocalDate.now().plusDays(30)
                DatePickerDialog(
                    context,
                    { _, y, m, d -> firstDue = LocalDate.of(y,m+1,d) },
                    base.year, base.monthValue-1, base.dayOfMonth
                ).apply { datePicker.minDate = System.currentTimeMillis() + 24L*60*60*1000 }.show()
            },
            modifier = Modifier.fillMaxWidth().height(50.dp)
        ) {
            Text(firstDue?.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) ?: "Escolher data de pagamento")
        }

        V08Section("Conta para receber")
        Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            listOf("cpf" to "CPF","phone" to "Celular","email" to "E-mail","random" to "Aleatória").forEach { (code,label) ->
                FilterChip(selected = pixType == code, onClick = { pixType = code }, label = { Text(label, fontSize = 10.sp) })
            }
        }
        V08Field("Chave Pix", pixKey) { pixKey = it }

        val principal = amount.replace(",", ".").toDoubleOrNull() ?: 0.0
        val rate = h?.monthlyRate ?: 0.0
        val quote = if (principal > 0 && firstDue != null) v08Quote(principal,installments,firstDue!!,rate) else null
        quote?.let { q ->
            V08Info(
                "Resumo antes de confirmar",
                "Valor: ${v08Brl(principal)}\nJuros até os vencimentos: ${v08Brl(q.second)}\nTotal: ${v08Brl(q.first)}\n${installments}x de aproximadamente ${v08Brl(q.first/installments)}\nPrimeiro pagamento: ${firstDue!!.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))}"
            )
        }
        if (lateTerms.lateInterestDailyRate > 0 || lateTerms.lateFeeRate > 0) {
            V08Info(
                "Em caso de atraso",
                "Juros de atraso: ${v08Pct(lateTerms.lateInterestDailyRate*100)}% ao dia${if(lateTerms.lateFeeRate>0) " · multa de ${v08Pct(lateTerms.lateFeeRate*100)}%" else ""}. O valor aumenta conforme os dias de atraso."
            )
        } else {
            V08Info("Em caso de atraso", "As taxas de atraso ainda não foram configuradas pelo Admin.")
        }
        error?.let { V08Error(it) }
        result?.let { r ->
            V08Success("Solicitação enviada", "Pedido ${r.loanId.take(8).uppercase()} registrado. Total ${v08Brl(r.totalAmount)} · juros ${v08Brl(r.interestAmount)} · primeiro vencimento ${v08Date(r.firstDueDate)}. A chave Pix foi vinculada ao pedido e já pode ser consultada no Admin.")
        }
        Button(
            onClick = {
                val s = session ?: return@Button
                val due = firstDue ?: return@Button
                if (principal <= 0 || principal > available) { error = "Informe um valor dentro do limite disponível."; return@Button }
                if (pixKey.trim().length < 3) { error = "Informe a chave Pix."; return@Button }
                loading = true; error = null; result = null
                scope.launch {
                    try {
                        result = LoanApiV08.submitLoanRequest(s.accessToken,principal,installments,pixType,pixKey,due.toString())
                    } catch(e:Exception) { error = v08Friendly(e) }
                    finally { loading = false }
                }
            },
            enabled = !loading && principal > 0 && principal <= available && pixKey.isNotBlank() && firstDue != null,
            modifier = Modifier.fillMaxWidth().height(52.dp)
        ) { Text(if(loading) "Enviando..." else "Enviar solicitação", fontWeight = FontWeight.Bold) }
    }
}

@Composable
fun V08Admin(session:Session?,onSelect:(AdminApplication)->Unit,onAudit:()->Unit,onLogout:()->Unit) {
    val scope = rememberCoroutineScope()
    var apps by remember { mutableStateOf<List<AdminApplication>>(emptyList()) }
    var loans by remember { mutableStateOf<List<V08AdminLoanRequest>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    fun load() {
        val token = session?.accessToken ?: return
        loading = true
        scope.launch {
            try {
                apps = SupabaseApi.listApplications(token)
                loans = LoanApiV08.listLoanRequests(token)
                error = null
            } catch(e:Exception) { error = v08Friendly(e) }
            finally { loading = false }
        }
    }
    LaunchedEffect(session?.accessToken) { load() }

    V08Page("Painel Admin", "Visão geral da operação", null) {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            V08Stat("Cadastros", apps.size.toString(), Modifier.weight(1f))
            V08Stat("Em análise", apps.count { it.status !in setOf("active","rejected","cancelled") }.toString(), Modifier.weight(1f))
        }
        Spacer(Modifier.height(8.dp))
        V08Secondary("Histórico de auditoria", onAudit)
        if (loading) LinearProgressIndicator(Modifier.fillMaxWidth().padding(top=12.dp))
        error?.let { V08Error(it) }

        V08Section("Solicitações de empréstimo")
        if (!loading && loans.isEmpty()) V08Info("Nenhuma solicitação", "Quando um cliente enviar um pedido, valor, vencimento e chave Pix aparecerão aqui.")
        loans.forEach { l ->
            Card(colors = CardDefaults.cardColors(containerColor = S08), modifier = Modifier.fillMaxWidth().padding(bottom=10.dp)) {
                Column(Modifier.padding(15.dp)) {
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text(l.clientName, fontWeight = FontWeight.Bold, fontSize = 17.sp)
                        V08Pill(l.status)
                    }
                    if(l.email.isNotBlank()) Text(l.email, color=M08, fontSize=11.sp)
                    Spacer(Modifier.height(8.dp))
                    Text("Solicitado: ${v08Brl(l.principal)}", color=T08, fontWeight=FontWeight.SemiBold)
                    Text("Juros: ${v08Brl(l.interestAmount)} · Total: ${v08Brl(l.totalAmount)} · ${l.installments}x", color=M08, fontSize=12.sp)
                    Text("Primeiro vencimento: ${v08Date(l.firstDueDate)}", color=M08, fontSize=12.sp)
                    Spacer(Modifier.height(8.dp))
                    Surface(color=B08.copy(alpha=.13f), shape=RoundedCornerShape(12.dp)) {
                        Column(Modifier.fillMaxWidth().padding(12.dp)) {
                            Text("Chave Pix para liberação", color=BS08, fontSize=11.sp, fontWeight=FontWeight.Bold)
                            Text("${v08PixType(l.pixType)}: ${l.pixValue}", color=T08, fontSize=15.sp, fontWeight=FontWeight.Bold)
                        }
                    }
                    if(l.lateInterestDailyRate>0 || l.lateFeeRate>0) {
                        Text("Atraso: ${v08Pct(l.lateInterestDailyRate*100)}%/dia${if(l.lateFeeRate>0) " + multa ${v08Pct(l.lateFeeRate*100)}%" else ""}", color=W08, fontSize=11.sp, modifier=Modifier.padding(top=7.dp))
                    }
                }
            }
        }

        V08Section("Análises de cadastro")
        if (!loading && apps.isEmpty()) V08Info("Sem cadastros", "Novos cadastros aparecerão aqui.")
        apps.forEach { a ->
            Card(
                modifier = Modifier.fillMaxWidth().padding(bottom = 9.dp).clickable { onSelect(a) },
                colors = CardDefaults.cardColors(containerColor = S08)
            ) {
                Column(Modifier.padding(15.dp)) {
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text(a.fullName, fontWeight = FontWeight.Bold)
                        V08Pill(a.status)
                    }
                    Text(a.email, color = M08, fontSize = 12.sp)
                }
            }
        }
        V08Secondary("Atualizar lista") { load() }
        TextButton(onClick = onLogout, modifier = Modifier.fillMaxWidth()) { Text("Sair do Admin") }
    }
}

@Composable
fun V08AdminDetail(session:Session?,application:AdminApplication?,onBack:()->Unit,onUpdated:()->Unit) {
    val scope = rememberCoroutineScope()
    var limit by remember { mutableStateOf(application?.approvedLimit?.toString() ?: "50") }
    var tier by remember { mutableStateOf(application?.approvedRiskTier ?: "novo") }
    var rate by remember { mutableStateOf(application?.approvedMonthlyRate?.let { (it*100).toString() } ?: "4") }
    var installments by remember { mutableStateOf(application?.approvedMaxInstallments?.toString() ?: "1") }
    var lateDaily by remember { mutableStateOf("0") }
    var lateFee by remember { mutableStateOf("0") }
    var notes by remember { mutableStateOf("") }
    var loading by remember { mutableStateOf(false) }
    var message by remember { mutableStateOf<String?>(null) }
    var error by remember { mutableStateOf<String?>(null) }

    V08Page("Análise do cliente", application?.fullName ?: "Cadastro", onBack) {
        val a = application
        val token = session?.accessToken
        if (a == null || token == null) { V08Error("Cadastro ou sessão Admin indisponível."); return@V08Page }
        V08Two("CPF", v08MaskCpf(a.cpf), "Nascimento", a.birthDate)
        V08Two("Cidade", "${a.city}/${a.state}", "Renda", a.monthlyIncome?.let(::v08Brl) ?: "—")
        V08Two("Profissão", a.occupation.ifBlank { "—" }, "Status", a.status)
        V08Section("Condições de crédito")
        V08Field("Limite aprovado (R$)", limit, KeyboardType.Decimal) { limit = it }
        V08Field("Faixa interna", tier) { tier = it }
        V08Field("Juros mensais (%)", rate, KeyboardType.Decimal) { rate = it }
        V08Field("Máximo de parcelas", installments, KeyboardType.Number) { installments = it }
        V08Section("Regra para atraso")
        V08Field("Juros de atraso (% ao dia)", lateDaily, KeyboardType.Decimal) { lateDaily = it }
        V08Field("Multa por atraso (%)", lateFee, KeyboardType.Decimal) { lateFee = it }
        Text("Essas taxas ficam gravadas na conta e são mostradas ao cliente antes de solicitar o empréstimo.", color=M08, fontSize=11.sp)
        V08Field("Observações", notes) { notes = it }
        message?.let { V08Success("Concluído", it) }
        error?.let { V08Error(it) }
        Button(
            onClick = {
                val l=limit.replace(",", ".").toDoubleOrNull(); val r=rate.replace(",", ".").toDoubleOrNull(); val n=installments.toIntOrNull(); val ld=lateDaily.replace(",", ".").toDoubleOrNull(); val lf=lateFee.replace(",", ".").toDoubleOrNull()
                if(l==null||l<=0||r==null||r<0||n==null||n<1||ld==null||ld<0||lf==null||lf<0) { error="Revise os valores das condições." }
                else {
                    loading=true;error=null;message=null
                    scope.launch {
                        try {
                            LoanApiV08.recordReviewV08(token,a.id,"approved",l,tier,r/100,n,ld/100,lf/100,notes)
                            message="Condições salvas. Juros de atraso e multa também foram registrados."
                        } catch(e:Exception) { error=v08Friendly(e) }
                        finally { loading=false }
                    }
                }
            }, enabled=!loading, modifier=Modifier.fillMaxWidth().height(52.dp)
        ) { Text(if(loading) "Salvando..." else "Aprovar condições") }
        Spacer(Modifier.height(8.dp))
        OutlinedButton(
            onClick={
                loading=true;error=null;message=null
                scope.launch { try { SupabaseApi.sendActivation(token,a.id); message="Código de acesso solicitado ao serviço de e-mail." } catch(e:Exception){error=v08Friendly(e)} finally{loading=false} }
            }, enabled=!loading, modifier=Modifier.fillMaxWidth().height(50.dp)
        ) { Text("Enviar código de acesso") }
        TextButton(
            onClick={
                loading=true
                scope.launch { try { LoanApiV08.recordReviewV08(token,a.id,"rejected",null,null,null,null,null,null,notes); onUpdated() } catch(e:Exception){error=v08Friendly(e)} finally{loading=false} }
            }, enabled=!loading, modifier=Modifier.fillMaxWidth()
        ) { Text("Não aprovar", color=D08) }
    }
}

private fun v08Quote(principal:Double, installments:Int, firstDue:LocalDate, monthlyRate:Double):Pair<Double,Double> {
    var interest = 0.0
    val part = principal / installments
    for(i in 0 until installments) {
        val due = firstDue.plusMonths(i.toLong())
        val days = ChronoUnit.DAYS.between(LocalDate.now(),due).coerceAtLeast(1)
        interest += v08Round(part * monthlyRate * (days.toDouble()/30.0))
    }
    interest = v08Round(interest)
    return v08Round(principal + interest) to interest
}

@Composable private fun V08Page(title:String,subtitle:String,onBack:(()->Unit)?,content:@Composable ColumnScope.()->Unit) {
    Column(Modifier.fillMaxSize().background(BG08).verticalScroll(rememberScrollState()).padding(18.dp)) {
        if(onBack!=null) TextButton(onClick=onBack, contentPadding=PaddingValues(0.dp)){Text("← Voltar")}
        Text(title,color=T08,fontSize=29.sp,fontWeight=FontWeight.Black)
        if(subtitle.isNotBlank()) Text(subtitle,color=M08,fontSize=13.sp)
        Spacer(Modifier.height(18.dp));content();Spacer(Modifier.height(28.dp));HorizontalDivider(color=SA08);Spacer(Modifier.height(10.dp));Text("CrediFlow · 0.8 · Professional",color=M08,fontSize=10.sp)
    }
}
@Composable private fun V08Logo(){Row(verticalAlignment=Alignment.CenterVertically){Box(Modifier.size(58.dp).background(B08,RoundedCornerShape(18.dp)),contentAlignment=Alignment.Center){Text("C",color=Color.White,fontSize=29.sp,fontWeight=FontWeight.Black)};Spacer(Modifier.width(12.dp));Column{Text("CrediFlow",fontSize=24.sp,fontWeight=FontWeight.Black);Text("Crédito que impulsiona você",color=M08,fontSize=11.sp)}}}
@Composable private fun V08Field(label:String,value:String,type:KeyboardType=KeyboardType.Text,onChange:(String)->Unit){OutlinedTextField(value,onChange,label={Text(label)},keyboardOptions=KeyboardOptions(keyboardType=type),singleLine=true,modifier=Modifier.fillMaxWidth().padding(bottom=8.dp))}
@Composable private fun V08Primary(label:String,onClick:()->Unit){Button(onClick=onClick,modifier=Modifier.fillMaxWidth().height(52.dp)){Text(label,fontWeight=FontWeight.Bold)}}
@Composable private fun V08Secondary(label:String,onClick:()->Unit){OutlinedButton(onClick=onClick,modifier=Modifier.fillMaxWidth().height(50.dp)){Text(label)}}
@Composable private fun V08Section(title:String){Text(title,fontSize=18.sp,fontWeight=FontWeight.Bold,modifier=Modifier.padding(top=14.dp,bottom=9.dp))}
@Composable private fun V08Info(title:String,body:String){Card(colors=CardDefaults.cardColors(containerColor=S08),modifier=Modifier.fillMaxWidth().padding(bottom=10.dp)){Column(Modifier.padding(15.dp)){Text(title,fontWeight=FontWeight.Bold);Text(body,color=M08,fontSize=12.sp,lineHeight=17.sp)}}}
@Composable private fun V08Success(title:String,body:String){Card(colors=CardDefaults.cardColors(containerColor=Color(0xFF0D2D26)),modifier=Modifier.fillMaxWidth().padding(bottom=10.dp)){Column(Modifier.padding(15.dp)){Text(title,color=OK08,fontWeight=FontWeight.Bold);Text(body,color=Color(0xFFD8F7E8),fontSize=12.sp,lineHeight=17.sp)}}}
@Composable private fun V08Error(body:String){Card(colors=CardDefaults.cardColors(containerColor=Color(0xFF331923)),modifier=Modifier.fillMaxWidth().padding(bottom=10.dp)){Text(body,color=Color(0xFFFFC0C8),fontSize=12.sp,modifier=Modifier.padding(15.dp))}}
@Composable private fun V08Step(n:String,title:String,status:String,color:Color){Row(Modifier.fillMaxWidth().padding(vertical=7.dp),verticalAlignment=Alignment.CenterVertically){Box(Modifier.size(35.dp).background(color.copy(alpha=.16f),RoundedCornerShape(11.dp)),contentAlignment=Alignment.Center){Text(n,color=color,fontWeight=FontWeight.Black)};Spacer(Modifier.width(12.dp));Column{Text(title,fontWeight=FontWeight.SemiBold);Text(status,color=color,fontSize=12.sp)}}}
@Composable private fun V08Two(t1:String,v1:String,t2:String,v2:String){Row(Modifier.fillMaxWidth().padding(bottom=8.dp),horizontalArrangement=Arrangement.spacedBy(8.dp)){listOf(t1 to v1,t2 to v2).forEach{(t,v)->Card(colors=CardDefaults.cardColors(containerColor=S08),modifier=Modifier.weight(1f)){Column(Modifier.padding(12.dp)){Text(t,color=M08,fontSize=10.sp);Text(v,fontWeight=FontWeight.Bold,fontSize=13.sp)}}}}}
@Composable private fun V08Pill(status:String){val c=when(status){"approved","activation_sent","active","paid"->OK08;"rejected","defaulted"->D08;else->W08};Surface(color=c.copy(alpha=.15f),shape=RoundedCornerShape(99.dp)){Text(status,color=c,fontSize=10.sp,modifier=Modifier.padding(horizontal=9.dp,vertical=5.dp))}}
@Composable private fun V08Stat(label:String,value:String,modifier:Modifier=Modifier){Card(colors=CardDefaults.cardColors(containerColor=SA08),modifier=modifier){Column(Modifier.padding(14.dp)){Text(label,color=M08,fontSize=11.sp);Text(value,fontSize=24.sp,fontWeight=FontWeight.Black)}}}
private fun v08Brl(v:Double)=NumberFormat.getCurrencyInstance(Locale("pt","BR")).format(v)
private fun v08Pct(v:Double)=String.format(Locale.US,"%.2f",v).replace(".",",")
private fun v08Round(v:Double)=round(v*100.0)/100.0
private fun v08Date(raw:String)=runCatching{LocalDate.parse(raw).format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))}.getOrDefault(raw.ifBlank{"—"})
private fun v08PixType(t:String)=when(t){"cpf"->"CPF";"phone"->"Celular";"email"->"E-mail";"random"->"Aleatória";else->t}
private fun v08MaskCpf(cpf:String):String{val d=cpf.filter(Char::isDigit);return if(d.length==11)"***.${d.substring(3,6)}.${d.substring(6,9)}-**" else "Protegido"}
private fun v08Friendly(e:Exception):String{val raw=e.message?:"Erro inesperado";return when{raw.contains("amount_exceeds_available_limit",true)->"O valor ultrapassa o limite disponível.";raw.contains("installments_exceed_approved_limit",true)->"A quantidade de parcelas ultrapassa o aprovado.";raw.contains("invalid_due_date",true)->"Escolha uma data de pagamento futura.";raw.contains("invalid_pix",true)->"Revise a chave Pix.";raw.contains("application_closed",true)->"Este cadastro já está encerrado.";else->raw.replace("_"," ")}}
