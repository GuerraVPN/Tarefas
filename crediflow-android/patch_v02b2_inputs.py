from pathlib import Path

MAIN = Path('crediflow-android/app/src/main/java/br/com/guerravpn/crediflow/MainActivity.kt')
API = Path('crediflow-android/app/src/main/java/br/com/guerravpn/crediflow/Api.kt')


def once(text: str, old: str, new: str, label: str) -> str:
    if old not in text:
        raise SystemExit(f'patch target not found: {label}')
    return text.replace(old, new, 1)

main = MAIN.read_text()
api = API.read_text()

# --- Api.kt: ViaCEP ---
api = once(api,
'''data class CorrectionMail(
    val recipient: String,
    val subject: String,
    val body: String
)
''',
'''data class CorrectionMail(
    val recipient: String,
    val subject: String,
    val body: String
)

data class CepAddress(
    val street: String,
    val neighborhood: String,
    val city: String,
    val state: String,
    val complement: String
)
''', 'CepAddress data class')

api = once(api,
'''    suspend fun submitApplication(
''',
'''    suspend fun lookupCep(cep: String): CepAddress? = withContext(Dispatchers.IO) {
        val digits = cep.filter(Char::isDigit)
        if (digits.length != 8) return@withContext null
        val c = URL("https://viacep.com.br/ws/$digits/json/").openConnection() as HttpURLConnection
        try {
            c.requestMethod = "GET"
            c.connectTimeout = 8_000
            c.readTimeout = 10_000
            c.setRequestProperty("Accept", "application/json")
            val code = c.responseCode
            if (code !in 200..299) return@withContext null
            val text = c.inputStream.bufferedReader().use { it.readText() }
            val j = JSONObject(text)
            if (j.optBoolean("erro", false)) return@withContext null
            CepAddress(
                street = j.optString("logradouro"),
                neighborhood = j.optString("bairro"),
                city = j.optString("localidade"),
                state = j.optString("uf"),
                complement = j.optString("complemento")
            )
        } finally {
            c.disconnect()
        }
    }

    suspend fun submitApplication(
''', 'lookupCep function')

# --- MainActivity.kt imports/date ---
main = once(main, 'import java.time.LocalDate\n', 'import java.time.LocalDate\nimport java.time.ZoneId\n', 'ZoneId import')
main = once(main,
'''            datePicker.maxDate = System.currentTimeMillis() - 18L * 365L * 24L * 60L * 60L * 1000L
''',
'''            datePicker.maxDate = today.minusYears(18)
                .atStartOfDay(ZoneId.systemDefault()).toInstant().toEpochMilli()
''', 'exact minimum age')

# Registration masks
main = once(main,
'''        Field("CPF", cpf, KeyboardType.Number) { cpf = it.filter(Char::isDigit).take(11) }
        Field("Celular", phone, KeyboardType.Phone) { phone = it }
''',
'''        Field("CPF", cpf, KeyboardType.Number) { cpf = formatCpfInput(it) }
        Field("Celular", phone, KeyboardType.Phone) { phone = formatPhoneInput(it) }
''', 'registration CPF/phone masks')

# Registration CEP lookup effect
main = once(main,
'''        }.show()
    }

    Page("Seu cadastro", "Preencha os dados para iniciar a análise.", onBack) {
''',
'''        }.show()
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
''', 'registration CEP lookup')

main = once(main,
'''        Section("Endereço")
        Field("Rua / avenida", street) { street = it }
        Field("Número", number) { number = it }
        Field("Complemento", complement) { complement = it }
        Field("Bairro", neighborhood) { neighborhood = it }
        Field("Cidade", city) { city = it }
        Field("UF", state) { state = it.uppercase().take(2) }
        Field("CEP", cep, KeyboardType.Number) { cep = it.filter(Char::isDigit).take(8) }

        Section("Dados para análise")
        Field("Profissão / ocupação", occupation) { occupation = it }
        Field("Renda mensal aproximada", income, KeyboardType.Decimal) { income = it }
''',
'''        Section("Endereço")
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
''', 'registration address and money')

main = once(main,
'''                } else {
                    val inc = income.replace(",", ".").toDoubleOrNull()
                    if (inc == null || inc < 0) {
                        error = "Informe uma renda válida."
                    } else {
''',
'''                } else if (!isValidCpf(cpf)) {
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
''', 'registration validation/money parse')

# Correction screen exact age
main = once(main,
'''        ).show()
    }

    val docLauncher = rememberLauncherForActivityResult(ActivityResultContracts.OpenDocument()) { uri ->
''',
'''        ).apply {
            datePicker.maxDate = now.minusYears(18)
                .atStartOfDay(ZoneId.systemDefault()).toInstant().toEpochMilli()
        }.show()
    }

    val docLauncher = rememberLauncherForActivityResult(ActivityResultContracts.OpenDocument()) { uri ->
''', 'correction exact minimum age')

main = once(main,
'''    LaunchedEffect(pending?.first) { refresh() }

    Page("Atualizar cadastro", "Corrija somente o que foi solicitado.", onBack) {
''',
'''    LaunchedEffect(pending?.first) { refresh() }
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
''', 'correction CEP lookup')

main = once(main,
'''        if ("cpf" in fields) Field("CPF", cpf, KeyboardType.Number) { cpf = it.filter(Char::isDigit).take(11) }
        if ("phone" in fields) Field("Celular", phone, KeyboardType.Phone) { phone = it }
''',
'''        if ("cpf" in fields) Field("CPF", cpf, KeyboardType.Number) { cpf = formatCpfInput(it) }
        if ("phone" in fields) Field("Celular", phone, KeyboardType.Phone) { phone = formatPhoneInput(it) }
''', 'correction masks')

main = once(main,
'''        if ("occupation" in fields) Field("Profissão / ocupação", occupation) { occupation = it }
        if ("monthly_income" in fields) Field("Renda mensal", income, KeyboardType.Decimal) { income = it }

        if ("address" in fields) {
            Section("Endereço")
            Field("Rua / avenida", street) { street = it }
            Field("Número", number) { number = it }
            Field("Complemento", complement) { complement = it }
            Field("Bairro", neighborhood) { neighborhood = it }
            Field("Cidade", city) { city = it }
            Field("UF", state) { state = it.uppercase().take(2) }
            Field("CEP", cep, KeyboardType.Number) { cep = it.filter(Char::isDigit).take(8) }
        }
''',
'''        if ("occupation" in fields) Field("Profissão / ocupação", occupation) { occupation = it }
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
''', 'correction money/address')

main = once(main,
'''                    if ("monthly_income" in fields && income.isNotBlank()) updates.put("monthly_income", income.replace(",", ".").toDoubleOrNull())
''',
'''                    if ("monthly_income" in fields && income.isNotBlank()) updates.put("monthly_income", moneyToDouble(income))
''', 'correction money parse')

# Admin display and limit currency prefix
main = once(main,
'''        Two("Telefone", app.phone, "Cidade", "${app.city}/${app.state}")
''',
'''        Two("Telefone", formatPhoneInput(app.phone), "Cidade", "${app.city}/${app.state}")
''', 'admin phone display')

main = once(main,
'''        Field("Limite aprovado (R$)", limit, KeyboardType.Decimal) { limit = it }
''',
'''        MoneyField("Limite aprovado", limit) { limit = it }
''', 'admin limit money field')

main = once(main,
'''                val l = limit.replace(",", ".").toDoubleOrNull()
''',
'''                val l = moneyToDouble(limit)
''', 'admin limit parse')

# Money field helper
main = once(main,
'''@Composable
private fun PassField(label: String, value: String, onChange: (String) -> Unit) {
''',
'''@Composable
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
''', 'MoneyField helper')

# Input format/validation helpers
main = once(main,
'''private fun verificationLabel(level: String?): String = when (level) {
''',
'''private fun formatCpfInput(value: String): String {
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

private fun verificationLabel(level: String?): String = when (level) {
''', 'input helpers')

MAIN.write_text(main)
API.write_text(api)
print('CrediFlow input/CEP patch applied successfully')
