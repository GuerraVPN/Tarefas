package br.com.guerravpn.crediflow

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URLEncoder
import java.net.URL
import java.nio.charset.StandardCharsets

data class V08LateTerms(
    val lateInterestDailyRate: Double,
    val lateFeeRate: Double
)

data class V08LoanRequestResult(
    val loanId: String,
    val totalAmount: Double,
    val interestAmount: Double,
    val installmentAmount: Double,
    val firstDueDate: String,
    val monthlyRate: Double,
    val lateInterestDailyRate: Double,
    val lateFeeRate: Double
)

data class V08AdminLoanRequest(
    val id: String,
    val userId: String,
    val clientName: String,
    val email: String,
    val principal: Double,
    val interestAmount: Double,
    val totalAmount: Double,
    val installments: Int,
    val status: String,
    val pixType: String,
    val pixValue: String,
    val firstDueDate: String,
    val monthlyRate: Double,
    val lateInterestDailyRate: Double,
    val lateFeeRate: Double,
    val requestedAt: String
)

object LoanApiV08 {
    private const val base = BuildConfig.SUPABASE_URL
    private const val key = BuildConfig.SUPABASE_PUBLISHABLE_KEY

    private suspend fun request(
        method: String,
        path: String,
        body: JSONObject? = null,
        accessToken: String
    ): String = withContext(Dispatchers.IO) {
        val c = URL(base + path).openConnection() as HttpURLConnection
        try {
            c.requestMethod = method
            c.connectTimeout = 15000
            c.readTimeout = 25000
            c.setRequestProperty("apikey", key)
            c.setRequestProperty("Authorization", "Bearer $accessToken")
            c.setRequestProperty("Accept", "application/json")
            c.setRequestProperty("Content-Type", "application/json")
            if (body != null) {
                c.doOutput = true
                c.outputStream.use { it.write(body.toString().toByteArray(StandardCharsets.UTF_8)) }
            }
            val code = c.responseCode
            val stream = if (code in 200..299) c.inputStream else c.errorStream
            val text = stream?.bufferedReader()?.use { it.readText() } ?: ""
            if (code !in 200..299) {
                val msg = try {
                    val j = JSONObject(text)
                    j.optString("message").ifBlank {
                        j.optString("error_description").ifBlank {
                            j.optString("error", "Falha no servidor")
                        }
                    }
                } catch (_: Exception) { "Falha no servidor" }
                throw ApiException(code, msg, text)
            }
            text
        } finally { c.disconnect() }
    }

    suspend fun loadLateTerms(accessToken: String): V08LateTerms {
        val a = JSONArray(request(
            "GET",
            "/rest/v1/credit_limits?select=late_interest_daily_rate,late_fee_rate&active=eq.true&limit=1",
            accessToken = accessToken
        ))
        if (a.length() == 0) return V08LateTerms(0.0, 0.0)
        val j = a.getJSONObject(0)
        return V08LateTerms(j.optDouble("late_interest_daily_rate", 0.0), j.optDouble("late_fee_rate", 0.0))
    }

    suspend fun submitLoanRequest(
        accessToken: String,
        amount: Double,
        installments: Int,
        pixType: String,
        pixKey: String,
        firstDueDate: String
    ): V08LoanRequestResult {
        val body = JSONObject()
            .put("p_amount", amount)
            .put("p_installments", installments)
            .put("p_pix_type", pixType)
            .put("p_pix_key", pixKey.trim())
            .put("p_first_due_date", firstDueDate)
        val a = JSONArray(request("POST", "/rest/v1/rpc/submit_loan_request", body, accessToken))
        if (a.length() == 0) throw ApiException(500, "Solicitação não foi criada")
        val j = a.getJSONObject(0)
        return V08LoanRequestResult(
            j.optString("loan_id"),
            j.optDouble("total_amount"),
            j.optDouble("interest_amount"),
            j.optDouble("installment_amount"),
            j.optString("first_due_date"),
            j.optDouble("monthly_rate"),
            j.optDouble("late_interest_daily_rate"),
            j.optDouble("late_fee_rate")
        )
    }

    suspend fun listLoanRequests(accessToken: String): List<V08AdminLoanRequest> {
        val loanSelect = "id,user_id,principal,interest_amount,total_amount,installments_count,status,first_due_date,monthly_interest_rate,late_interest_daily_rate,late_fee_rate,requested_at,user_pix_keys(key_type,key_value,key_masked)"
        val loans = JSONArray(request(
            "GET",
            "/rest/v1/loans?select=${URLEncoder.encode(loanSelect, "UTF-8")}&order=requested_at.desc&limit=100",
            accessToken = accessToken
        ))
        val profiles = JSONArray(request(
            "GET",
            "/rest/v1/profiles?select=user_id,full_name,display_name,email&limit=500",
            accessToken = accessToken
        ))
        val profileMap = mutableMapOf<String, JSONObject>()
        for (i in 0 until profiles.length()) {
            val p = profiles.getJSONObject(i)
            profileMap[p.optString("user_id")] = p
        }
        return (0 until loans.length()).map { i ->
            val j = loans.getJSONObject(i)
            val userId = j.optString("user_id")
            val p = profileMap[userId]
            val pix = j.optJSONObject("user_pix_keys") ?: JSONObject()
            val full = p?.optString("full_name").orEmpty()
            val display = p?.optString("display_name").orEmpty()
            V08AdminLoanRequest(
                id = j.optString("id"),
                userId = userId,
                clientName = display.ifBlank { full.ifBlank { "Cliente ${userId.take(8)}" } },
                email = p?.optString("email").orEmpty(),
                principal = j.optDouble("principal"),
                interestAmount = j.optDouble("interest_amount"),
                totalAmount = j.optDouble("total_amount"),
                installments = j.optInt("installments_count"),
                status = j.optString("status"),
                pixType = pix.optString("key_type"),
                pixValue = pix.optString("key_value").ifBlank { pix.optString("key_masked") },
                firstDueDate = j.optString("first_due_date"),
                monthlyRate = j.optDouble("monthly_interest_rate"),
                lateInterestDailyRate = j.optDouble("late_interest_daily_rate"),
                lateFeeRate = j.optDouble("late_fee_rate"),
                requestedAt = j.optString("requested_at")
            )
        }
    }

    suspend fun recordReviewV08(
        accessToken: String,
        applicationId: String,
        decision: String,
        approvedLimit: Double?,
        riskTier: String?,
        monthlyRate: Double?,
        maxInstallments: Int?,
        lateInterestDailyRate: Double?,
        lateFeeRate: Double?,
        notes: String
    ) {
        val body = JSONObject()
            .put("applicationId", applicationId)
            .put("decision", decision)
            .put("notes", notes)
        if (decision == "approved") {
            body.put("approvedLimit", approvedLimit)
                .put("riskTier", riskTier)
                .put("monthlyRate", monthlyRate)
                .put("maxInstallments", maxInstallments)
                .put("lateInterestDailyRate", lateInterestDailyRate ?: 0.0)
                .put("lateFeeRate", lateFeeRate ?: 0.0)
        }
        request("POST", "/functions/v1/admin-record-review", body, accessToken)
    }
}
