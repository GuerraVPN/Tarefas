package br.com.guerravpn.crediflow

import android.content.Context
import android.util.Base64
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URLEncoder
import java.net.URL
import java.nio.charset.StandardCharsets
import java.util.UUID

data class Session(
    val accessToken: String,
    val refreshToken: String,
    val email: String,
    val role: String,
    val activationRequired: Boolean
)

data class ApplicationStatus(
    val status: String,
    val approvedLimit: Double?,
    val activationReady: Boolean,
    val correctionFields: List<String>,
    val correctionNote: String?,
    val verificationScore: Int?,
    val verificationLevel: String?,
    val documentStatus: Map<String, String>
)

data class AdminApplication(
    val id: String,
    val status: String,
    val email: String,
    val fullName: String,
    val phone: String,
    val cpf: String,
    val birthDate: String,
    val city: String,
    val state: String,
    val occupation: String,
    val monthlyIncome: Double?,
    val approvedLimit: Double?,
    val approvedRiskTier: String?,
    val approvedMonthlyRate: Double?,
    val approvedMaxInstallments: Int?,
    val createdAt: String
)

data class AdminDocument(
    val kind: String,
    val status: String,
    val mimeType: String?,
    val signedUrl: String?
)

data class AdminDetail(
    val application: AdminApplication,
    val verificationScore: Int?,
    val verificationLevel: String?,
    val verificationSignals: JSONObject?,
    val documents: List<AdminDocument>,
    val correctionFields: List<String>,
    val correctionNote: String?
)

data class ActivationCodeResult(
    val email: String,
    val code: String,
    val expiresAt: String
)

data class CorrectionMail(
    val recipient: String,
    val subject: String,
    val body: String
)

data class LoanSummary(
    val id: String,
    val principal: Double,
    val totalAmount: Double,
    val installments: Int,
    val status: String,
    val requestedAt: String
)

data class ClientHome(
    val fullName: String,
    val email: String,
    val phone: String,
    val accountStatus: String,
    val limitAmount: Double,
    val riskTier: String?,
    val monthlyRate: Double?,
    val maxInstallments: Int,
    val usedLimit: Double,
    val loans: List<LoanSummary>
)

class ApiException(val statusCode: Int, message: String, val payload: String = "") : Exception(message)

class SessionStore(context: Context) {
    private val p = context.getSharedPreferences("crediflow_secure_state", Context.MODE_PRIVATE)

    fun saveSession(s: Session) {
        p.edit()
            .putString("access_token", s.accessToken)
            .putString("refresh_token", s.refreshToken)
            .putString("email", s.email)
            .putString("role", s.role)
            .putBoolean("activation_required", s.activationRequired)
            .apply()
    }

    fun session(): Session? {
        val access = p.getString("access_token", null) ?: return null
        return Session(
            access,
            p.getString("refresh_token", "") ?: "",
            p.getString("email", "") ?: "",
            p.getString("role", "client") ?: "client",
            p.getBoolean("activation_required", false)
        )
    }

    fun clearSession() {
        p.edit()
            .remove("access_token")
            .remove("refresh_token")
            .remove("email")
            .remove("role")
            .remove("activation_required")
            .apply()
    }

    fun savePendingApplication(id: String, secret: String, email: String) {
        p.edit()
            .putString("application_id", id)
            .putString("application_secret", secret)
            .putString("application_email", email)
            .apply()
    }

    fun pendingApplication(): Triple<String, String, String>? {
        val id = p.getString("application_id", null) ?: return null
        val secret = p.getString("application_secret", null) ?: return null
        return Triple(id, secret, p.getString("application_email", "") ?: "")
    }

    fun clearPendingApplication() {
        p.edit()
            .remove("application_id")
            .remove("application_secret")
            .remove("application_email")
            .apply()
    }
}

object SupabaseApi {
    private const val base = BuildConfig.SUPABASE_URL
    private const val key = BuildConfig.SUPABASE_PUBLISHABLE_KEY

    private suspend fun request(
        method: String,
        path: String,
        body: JSONObject? = null,
        accessToken: String? = null
    ): String = withContext(Dispatchers.IO) {
        val c = URL(base + path).openConnection() as HttpURLConnection
        try {
            c.requestMethod = method
            c.connectTimeout = 20_000
            c.readTimeout = 30_000
            c.setRequestProperty("apikey", key)
            c.setRequestProperty("Accept", "application/json")
            c.setRequestProperty("Content-Type", "application/json")
            if (!accessToken.isNullOrBlank()) {
                c.setRequestProperty("Authorization", "Bearer $accessToken")
            }
            if (body != null) {
                c.doOutput = true
                c.outputStream.use {
                    it.write(body.toString().toByteArray(StandardCharsets.UTF_8))
                }
            }

            val code = c.responseCode
            val stream = if (code in 200..299) c.inputStream else c.errorStream
            val text = stream?.bufferedReader()?.use { it.readText() } ?: ""

            if (code !in 200..299) {
                val msg = try {
                    val obj = JSONObject(text)
                    obj.optString("error_description").ifBlank {
                        obj.optString("msg").ifBlank {
                            obj.optString("message").ifBlank {
                                obj.optString("error", "Falha no servidor")
                            }
                        }
                    }
                } catch (_: Exception) {
                    "Falha no servidor"
                }
                throw ApiException(code, msg, text)
            }
            text
        } finally {
            c.disconnect()
        }
    }

    private fun jwtPayload(token: String): JSONObject = try {
        val part = token.split(".").getOrNull(1) ?: return JSONObject()
        val bytes = Base64.decode(part, Base64.URL_SAFE or Base64.NO_WRAP or Base64.NO_PADDING)
        JSONObject(String(bytes, StandardCharsets.UTF_8))
    } catch (_: Exception) {
        JSONObject()
    }

    private fun sessionFromJson(text: String): Session {
        val j = JSONObject(text)
        val access = j.getString("access_token")
        val refresh = j.optString("refresh_token")
        val user = j.optJSONObject("user") ?: JSONObject()
        val meta = user.optJSONObject("app_metadata")
            ?: jwtPayload(access).optJSONObject("app_metadata")
            ?: JSONObject()

        return Session(
            accessToken = access,
            refreshToken = refresh,
            email = user.optString("email").ifBlank { jwtPayload(access).optString("email") },
            role = meta.optString("role", "client"),
            activationRequired = meta.optBoolean("activation_required", false)
        )
    }

    suspend fun submitApplication(
        fullName: String,
        email: String,
        cpf: String,
        phone: String,
        birthDate: String,
        addressLine: String,
        addressNumber: String,
        addressComplement: String,
        neighborhood: String,
        city: String,
        state: String,
        postalCode: String,
        occupation: String,
        monthlyIncome: Double
    ): Triple<String, String, String> {
        val secret = UUID.randomUUID().toString() + UUID.randomUUID().toString().replace("-", "")
        val b = JSONObject()
            .put("p_full_name", fullName)
            .put("p_email", email)
            .put("p_cpf", cpf.filter(Char::isDigit))
            .put("p_phone", phone.filter(Char::isDigit))
            .put("p_birth_date", birthDate)
            .put("p_address_line", addressLine)
            .put("p_address_number", addressNumber)
            .put("p_address_complement", addressComplement)
            .put("p_neighborhood", neighborhood)
            .put("p_city", city)
            .put("p_state", state)
            .put("p_postal_code", postalCode.filter(Char::isDigit))
            .put("p_occupation", occupation)
            .put("p_monthly_income", monthlyIncome)
            .put("p_status_secret", secret)

        val a = JSONArray(request("POST", "/rest/v1/rpc/submit_credit_application", b))
        if (a.length() == 0) throw ApiException(500, "Cadastro não foi criado")
        val r = a.getJSONObject(0)
        return Triple(r.getString("application_id"), secret, r.optString("application_status"))
    }

    suspend fun checkApplication(id: String, secret: String): ApplicationStatus {
        val a = JSONArray(
            request(
                "POST",
                "/rest/v1/rpc/check_credit_application_status",
                JSONObject()
                    .put("p_application_id", id)
                    .put("p_status_secret", secret)
            )
        )
        if (a.length() == 0) throw ApiException(404, "Solicitação não encontrada")
        val j = a.getJSONObject(0)

        val correctionFields = mutableListOf<String>()
        j.optJSONArray("correction_fields")?.let { arr ->
            for (i in 0 until arr.length()) correctionFields += arr.optString(i)
        }

        val docs = mutableMapOf<String, String>()
        j.optJSONObject("document_status")?.let { obj ->
            obj.keys().forEach { k -> docs[k] = obj.optString(k) }
        }

        return ApplicationStatus(
            status = j.optString("application_status"),
            approvedLimit = if (j.isNull("approved_limit")) null else j.optDouble("approved_limit"),
            activationReady = j.optBoolean("activation_ready", false),
            correctionFields = correctionFields,
            correctionNote = if (j.isNull("correction_note")) null else j.optString("correction_note"),
            verificationScore = if (j.isNull("verification_score")) null else j.optInt("verification_score"),
            verificationLevel = if (j.isNull("verification_level")) null else j.optString("verification_level"),
            documentStatus = docs
        )
    }

    suspend fun uploadApplicationDocument(
        applicationId: String,
        statusSecret: String,
        kind: String,
        mimeType: String,
        bytes: ByteArray
    ): ApplicationStatus {
        val encoded = Base64.encodeToString(bytes, Base64.NO_WRAP)
        request(
            "POST",
            "/functions/v1/application-document-upload",
            JSONObject()
                .put("applicationId", applicationId)
                .put("statusSecret", statusSecret)
                .put("kind", kind)
                .put("mimeType", mimeType)
                .put("base64", encoded)
        )
        return checkApplication(applicationId, statusSecret)
    }

    suspend fun updateCorrections(
        applicationId: String,
        statusSecret: String,
        updates: JSONObject
    ) {
        request(
            "POST",
            "/functions/v1/application-update-corrections",
            JSONObject()
                .put("applicationId", applicationId)
                .put("statusSecret", statusSecret)
                .put("updates", updates)
        )
    }

    suspend fun signIn(email: String, password: String): Session =
        sessionFromJson(
            request(
                "POST",
                "/auth/v1/token?grant_type=password",
                JSONObject().put("email", email.trim()).put("password", password)
            )
        )

    suspend fun activateManual(email: String, code: String, password: String): Session {
        request(
            "POST",
            "/functions/v1/activate-manual",
            JSONObject()
                .put("email", email.trim())
                .put("code", code.trim())
                .put("password", password)
        )
        return signIn(email, password)
    }

    suspend fun refreshSession(refresh: String): Session =
        sessionFromJson(
            request(
                "POST",
                "/auth/v1/token?grant_type=refresh_token",
                JSONObject().put("refresh_token", refresh)
            )
        )

    private fun parseAdminApplication(j: JSONObject): AdminApplication = AdminApplication(
        id = j.getString("id"),
        status = j.optString("status"),
        email = j.optString("email"),
        fullName = j.optString("full_name"),
        phone = j.optString("phone"),
        cpf = j.optString("cpf"),
        birthDate = j.optString("birth_date"),
        city = j.optString("city"),
        state = j.optString("state"),
        occupation = j.optString("occupation"),
        monthlyIncome = if (j.isNull("monthly_income")) null else j.optDouble("monthly_income"),
        approvedLimit = if (j.isNull("approved_limit")) null else j.optDouble("approved_limit"),
        approvedRiskTier = if (j.isNull("approved_risk_tier")) null else j.optString("approved_risk_tier"),
        approvedMonthlyRate = if (j.isNull("approved_monthly_rate")) null else j.optDouble("approved_monthly_rate"),
        approvedMaxInstallments = if (j.isNull("approved_max_installments")) null else j.optInt("approved_max_installments"),
        createdAt = j.optString("created_at")
    )

    suspend fun listApplications(access: String): List<AdminApplication> {
        val select = "id,status,email,full_name,phone,cpf,birth_date,city,state,occupation,monthly_income,approved_limit,approved_risk_tier,approved_monthly_rate,approved_max_installments,created_at"
        val a = JSONArray(
            request(
                "GET",
                "/rest/v1/credit_applications?select=${URLEncoder.encode(select, "UTF-8")}&order=created_at.desc&limit=100",
                accessToken = access
            )
        )
        return (0 until a.length()).map { parseAdminApplication(a.getJSONObject(it)) }
    }

    suspend fun adminDetail(access: String, applicationId: String): AdminDetail {
        val root = JSONObject(
            request(
                "POST",
                "/functions/v1/admin-application-detail",
                JSONObject().put("applicationId", applicationId),
                access
            )
        )
        val app = parseAdminApplication(root.getJSONObject("application"))
        val v = root.optJSONObject("verification")
        val docs = mutableListOf<AdminDocument>()
        root.optJSONArray("documents")?.let { arr ->
            for (i in 0 until arr.length()) {
                val d = arr.getJSONObject(i)
                val kind = when {
                    d.optString("document_type") == "identity" && d.optString("side") == "front" -> "identity_front"
                    d.optString("document_type") == "identity" && d.optString("side") == "back" -> "identity_back"
                    else -> "payslip"
                }
                docs += AdminDocument(
                    kind,
                    d.optString("status"),
                    if (d.isNull("mime_type")) null else d.optString("mime_type"),
                    if (d.isNull("signed_url")) null else d.optString("signed_url")
                )
            }
        }
        val cr = root.optJSONObject("correction")
        val correctionFields = mutableListOf<String>()
        cr?.optJSONArray("requested_fields")?.let { arr ->
            for (i in 0 until arr.length()) correctionFields += arr.optString(i)
        }

        return AdminDetail(
            application = app,
            verificationScore = v?.takeUnless { it.isNull("verification_score") }?.optInt("verification_score"),
            verificationLevel = v?.takeUnless { it.isNull("level") }?.optString("level"),
            verificationSignals = v?.optJSONObject("signals"),
            documents = docs,
            correctionFields = correctionFields,
            correctionNote = cr?.takeUnless { it.isNull("note") }?.optString("note")
        )
    }

    suspend fun recordReview(
        access: String,
        id: String,
        decision: String,
        limit: Double?,
        tier: String?,
        rate: Double?,
        max: Int?,
        notes: String
    ) {
        val j = JSONObject()
            .put("applicationId", id)
            .put("decision", decision)
            .put("notes", notes)
        if (decision == "approved") {
            j.put("approvedLimit", limit)
                .put("riskTier", tier)
                .put("monthlyRate", rate)
                .put("maxInstallments", max)
        }
        request("POST", "/functions/v1/admin-record-review", j, access)
    }

    suspend fun generateActivation(access: String, id: String): ActivationCodeResult {
        val r = JSONObject(
            request(
                "POST",
                "/functions/v1/admin-generate-activation",
                JSONObject().put("applicationId", id),
                access
            )
        )
        return ActivationCodeResult(
            email = r.optString("email"),
            code = r.optString("code"),
            expiresAt = r.optString("expiresAt")
        )
    }

    suspend fun requestCorrection(
        access: String,
        id: String,
        fields: List<String>,
        note: String
    ): CorrectionMail {
        val r = JSONObject(
            request(
                "POST",
                "/functions/v1/admin-request-correction",
                JSONObject()
                    .put("applicationId", id)
                    .put("fields", JSONArray(fields))
                    .put("note", note),
                access
            )
        )
        return CorrectionMail(
            recipient = r.optString("recipient"),
            subject = r.optString("subject"),
            body = r.optString("body")
        )
    }

    suspend fun loadClientHome(access: String): ClientHome {
        val pa = JSONArray(
            request(
                "GET",
                "/rest/v1/profiles?select=full_name,email,phone,account_status&limit=1",
                accessToken = access
            )
        )
        val p = if (pa.length() > 0) pa.getJSONObject(0) else JSONObject()

        val la = JSONArray(
            request(
                "GET",
                "/rest/v1/credit_limits?select=limit_amount,risk_tier,monthly_rate,max_installments&active=eq.true&limit=1",
                accessToken = access
            )
        )
        val l = if (la.length() > 0) la.getJSONObject(0) else JSONObject()

        val xa = JSONArray(
            request(
                "GET",
                "/rest/v1/loans?select=id,principal,total_amount,installments_count,status,requested_at&order=requested_at.desc",
                accessToken = access
            )
        )
        val loans = (0 until xa.length()).map {
            val j = xa.getJSONObject(it)
            LoanSummary(
                j.optString("id"),
                j.optDouble("principal"),
                j.optDouble("total_amount"),
                j.optInt("installments_count"),
                j.optString("status"),
                j.optString("requested_at")
            )
        }
        val used = loans
            .filter { it.status in setOf("requested", "approved", "disbursing", "active", "late") }
            .sumOf { it.principal }

        return ClientHome(
            fullName = p.optString("full_name", "Cliente"),
            email = p.optString("email"),
            phone = p.optString("phone"),
            accountStatus = p.optString("account_status", "active"),
            limitAmount = l.optDouble("limit_amount", 0.0),
            riskTier = if (l.isNull("risk_tier")) null else l.optString("risk_tier"),
            monthlyRate = if (l.isNull("monthly_rate")) null else l.optDouble("monthly_rate"),
            maxInstallments = l.optInt("max_installments", 1),
            usedLimit = used,
            loans = loans
        )
    }
}
