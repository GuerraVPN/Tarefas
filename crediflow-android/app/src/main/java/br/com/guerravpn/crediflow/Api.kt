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
    val activationRequired: Boolean,
    val userId: String
)
data class ApplicationStatus(val status:String,val openFinanceStatus:String,val approvedLimit:Double?,val activationReady:Boolean)
data class AdminApplication(val id:String,val status:String,val email:String,val fullName:String,val phone:String,val cpf:String,val birthDate:String,val city:String,val state:String,val occupation:String,val monthlyIncome:Double?,val openFinanceStatus:String,val approvedLimit:Double?,val approvedRiskTier:String?,val approvedMonthlyRate:Double?,val approvedMaxInstallments:Int?,val createdAt:String)
data class LoanSummary(val id:String,val principal:Double,val totalAmount:Double,val installments:Int,val status:String,val requestedAt:String)
data class ClientHome(
    val fullName:String,
    val displayName:String,
    val email:String,
    val phone:String,
    val cpfLast4:String,
    val avatarPath:String?,
    val accountStatus:String,
    val limitAmount:Double,
    val riskTier:String?,
    val monthlyRate:Double?,
    val maxInstallments:Int,
    val usedLimit:Double,
    val loans:List<LoanSummary>
)
class ApiException(val statusCode:Int,message:String,val payload:String=""):Exception(message)

class SessionStore(context:Context){
    private val p=context.getSharedPreferences("crediflow_secure_state",Context.MODE_PRIVATE)
    fun saveSession(s:Session){
        p.edit()
            .putString("access_token",s.accessToken)
            .putString("refresh_token",s.refreshToken)
            .putString("email",s.email)
            .putString("role",s.role)
            .putBoolean("activation_required",s.activationRequired)
            .putString("user_id",s.userId)
            .apply()
    }
    fun session():Session?{
        val a=p.getString("access_token",null)?:return null
        return Session(
            a,
            p.getString("refresh_token","")?:"",
            p.getString("email","")?:"",
            p.getString("role","client")?:"client",
            p.getBoolean("activation_required",false),
            p.getString("user_id","")?:""
        )
    }
    fun clearSession(){p.edit().remove("access_token").remove("refresh_token").remove("email").remove("role").remove("activation_required").remove("user_id").apply()}
    fun savePendingApplication(id:String,secret:String,email:String){p.edit().putString("application_id",id).putString("application_secret",secret).putString("application_email",email).apply()}
    fun pendingApplication():Triple<String,String,String>?{val id=p.getString("application_id",null)?:return null;val s=p.getString("application_secret",null)?:return null;return Triple(id,s,p.getString("application_email","")?:"")}
    fun clearPendingApplication(){p.edit().remove("application_id").remove("application_secret").remove("application_email").apply()}
}

object SupabaseApi{
    private const val base=BuildConfig.SUPABASE_URL
    private const val key=BuildConfig.SUPABASE_PUBLISHABLE_KEY

    private suspend fun request(method:String,path:String,body:JSONObject?=null,accessToken:String?=null):String=withContext(Dispatchers.IO){
        val c=URL(base+path).openConnection() as HttpURLConnection
        try{
            c.requestMethod=method;c.connectTimeout=15000;c.readTimeout=20000
            c.setRequestProperty("apikey",key);c.setRequestProperty("Accept","application/json");c.setRequestProperty("Content-Type","application/json")
            if(!accessToken.isNullOrBlank())c.setRequestProperty("Authorization","Bearer $accessToken")
            if(body!=null){c.doOutput=true;c.outputStream.use{it.write(body.toString().toByteArray(StandardCharsets.UTF_8))}}
            val code=c.responseCode;val stream=if(code in 200..299)c.inputStream else c.errorStream;val text=stream?.bufferedReader()?.use{it.readText()}?:""
            if(code !in 200..299){
                val msg=try{val j=JSONObject(text);j.optString("error_description").ifBlank{j.optString("msg").ifBlank{j.optString("message").ifBlank{j.optString("error","Falha no servidor")}}}}catch(_:Exception){"Falha no servidor"}
                throw ApiException(code,msg,text)
            };text
        }finally{c.disconnect()}
    }

    private suspend fun uploadObject(path:String,bytes:ByteArray,mime:String,accessToken:String):String=withContext(Dispatchers.IO){
        val c=URL("$base/storage/v1/object/profile-avatars/$path").openConnection() as HttpURLConnection
        try{
            c.requestMethod="POST";c.connectTimeout=15000;c.readTimeout=30000;c.doOutput=true
            c.setRequestProperty("apikey",key)
            c.setRequestProperty("Authorization","Bearer $accessToken")
            c.setRequestProperty("Content-Type",mime)
            c.setRequestProperty("x-upsert","false")
            c.outputStream.use{it.write(bytes)}
            val code=c.responseCode;val stream=if(code in 200..299)c.inputStream else c.errorStream;val text=stream?.bufferedReader()?.use{it.readText()}?:""
            if(code !in 200..299)throw ApiException(code,"Falha ao enviar foto",text)
            path
        }finally{c.disconnect()}
    }

    private fun jwtPayload(token:String):JSONObject=try{val part=token.split(".").getOrNull(1)?:return JSONObject();val bytes=Base64.decode(part,Base64.URL_SAFE or Base64.NO_WRAP or Base64.NO_PADDING);JSONObject(String(bytes,StandardCharsets.UTF_8))}catch(_:Exception){JSONObject()}
    private fun sessionFromJson(text:String):Session{
        val j=JSONObject(text);val access=j.getString("access_token");val refresh=j.optString("refresh_token");val user=j.optJSONObject("user")?:JSONObject();val payload=jwtPayload(access);val meta=user.optJSONObject("app_metadata")?:payload.optJSONObject("app_metadata")?:JSONObject()
        return Session(access,refresh,user.optString("email").ifBlank{payload.optString("email")},meta.optString("role","client"),meta.optBoolean("activation_required",false),user.optString("id").ifBlank{payload.optString("sub")})
    }

    suspend fun submitApplication(fullName:String,email:String,cpf:String,phone:String,birthDate:String,addressLine:String,addressNumber:String,addressComplement:String,neighborhood:String,city:String,state:String,postalCode:String,occupation:String,monthlyIncome:Double):Triple<String,String,String>{
        val secret=UUID.randomUUID().toString()+UUID.randomUUID().toString().replace("-","")
        val b=JSONObject().put("p_full_name",fullName).put("p_email",email).put("p_cpf",cpf.filter(Char::isDigit)).put("p_phone",phone.filter(Char::isDigit)).put("p_birth_date",birthDate).put("p_address_line",addressLine).put("p_address_number",addressNumber).put("p_address_complement",addressComplement).put("p_neighborhood",neighborhood).put("p_city",city).put("p_state",state).put("p_postal_code",postalCode.filter(Char::isDigit)).put("p_occupation",occupation).put("p_monthly_income",monthlyIncome).put("p_status_secret",secret)
        val a=JSONArray(request("POST","/rest/v1/rpc/submit_credit_application",b));if(a.length()==0)throw ApiException(500,"Cadastro não foi criado");val r=a.getJSONObject(0);return Triple(r.getString("application_id"),secret,r.optString("application_status"))
    }
    suspend fun checkApplication(id:String,secret:String):ApplicationStatus{val a=JSONArray(request("POST","/rest/v1/rpc/check_credit_application_status",JSONObject().put("p_application_id",id).put("p_status_secret",secret)));if(a.length()==0)throw ApiException(404,"Solicitação não encontrada");val j=a.getJSONObject(0);return ApplicationStatus(j.optString("application_status"),j.optString("open_finance_status"),if(j.isNull("approved_limit"))null else j.optDouble("approved_limit"),j.optBoolean("activation_ready",false))}
    suspend fun signIn(email:String,password:String)=sessionFromJson(request("POST","/auth/v1/token?grant_type=password",JSONObject().put("email",email.trim()).put("password",password)))
    suspend fun verifyEmailOtp(email:String,code:String)=sessionFromJson(request("POST","/auth/v1/verify",JSONObject().put("type","email").put("email",email.trim()).put("token",code.trim())))
    suspend fun refreshSession(refresh:String)=sessionFromJson(request("POST","/auth/v1/token?grant_type=refresh_token",JSONObject().put("refresh_token",refresh)))
    suspend fun setPassword(access:String,password:String){request("PUT","/auth/v1/user",JSONObject().put("password",password),access)}
    suspend fun changePassword(access:String,password:String):Boolean{
        setPassword(access,password)
        return try{request("POST","/rest/v1/rpc/record_password_change_event",JSONObject(),access);true}catch(_:Exception){false}
    }
    suspend fun completeActivation(access:String){request("POST","/functions/v1/complete-activation",JSONObject(),access)}

    suspend fun listApplications(access:String):List<AdminApplication>{
        val select="id,status,email,full_name,phone,cpf,birth_date,city,state,occupation,monthly_income,open_finance_status,approved_limit,approved_risk_tier,approved_monthly_rate,approved_max_installments,created_at"
        val a=JSONArray(request("GET","/rest/v1/credit_applications?select=${URLEncoder.encode(select,"UTF-8")}&order=created_at.desc&limit=100",accessToken=access))
        return (0 until a.length()).map{i->val j=a.getJSONObject(i);AdminApplication(j.getString("id"),j.optString("status"),j.optString("email"),j.optString("full_name"),j.optString("phone"),j.optString("cpf"),j.optString("birth_date"),j.optString("city"),j.optString("state"),j.optString("occupation"),if(j.isNull("monthly_income"))null else j.optDouble("monthly_income"),j.optString("open_finance_status"),if(j.isNull("approved_limit"))null else j.optDouble("approved_limit"),if(j.isNull("approved_risk_tier"))null else j.optString("approved_risk_tier"),if(j.isNull("approved_monthly_rate"))null else j.optDouble("approved_monthly_rate"),if(j.isNull("approved_max_installments"))null else j.optInt("approved_max_installments"),j.optString("created_at"))}
    }
    suspend fun recordReview(access:String,id:String,decision:String,limit:Double?,tier:String?,rate:Double?,max:Int?,notes:String){val j=JSONObject().put("applicationId",id).put("decision",decision).put("notes",notes);if(decision=="approved")j.put("approvedLimit",limit).put("riskTier",tier).put("monthlyRate",rate).put("maxInstallments",max);request("POST","/functions/v1/admin-record-review",j,access)}
    suspend fun sendActivation(access:String,id:String){request("POST","/functions/v1/admin-send-activation",JSONObject().put("applicationId",id),access)}

    suspend fun loadClientHome(access:String):ClientHome{
        val pa=JSONArray(request("GET","/rest/v1/profiles?select=full_name,display_name,email,phone,cpf_last4,avatar_path,account_status&limit=1",accessToken=access));val p=if(pa.length()>0)pa.getJSONObject(0)else JSONObject()
        val la=JSONArray(request("GET","/rest/v1/credit_limits?select=limit_amount,risk_tier,monthly_rate,max_installments&active=eq.true&limit=1",accessToken=access));val l=if(la.length()>0)la.getJSONObject(0)else JSONObject()
        val xa=JSONArray(request("GET","/rest/v1/loans?select=id,principal,total_amount,installments_count,status,requested_at&order=requested_at.desc",accessToken=access));val loans=(0 until xa.length()).map{i->val j=xa.getJSONObject(i);LoanSummary(j.optString("id"),j.optDouble("principal"),j.optDouble("total_amount"),j.optInt("installments_count"),j.optString("status"),j.optString("requested_at"))};val used=loans.filter{it.status in setOf("requested","approved","disbursing","active","late")}.sumOf{it.principal}
        val full=p.optString("full_name","Cliente");val display=p.optString("display_name").ifBlank{full.substringBefore(" ")}
        return ClientHome(full,display,p.optString("email"),p.optString("phone"),p.optString("cpf_last4"),if(p.isNull("avatar_path"))null else p.optString("avatar_path"),p.optString("account_status","active"),l.optDouble("limit_amount",0.0),if(l.isNull("risk_tier"))null else l.optString("risk_tier"),if(l.isNull("monthly_rate"))null else l.optDouble("monthly_rate"),l.optInt("max_installments",1),used,loans)
    }

    suspend fun loadProfileSettings(access:String):ProfileSettings{
        val a=JSONArray(request("GET","/rest/v1/profiles?select=full_name,display_name,email,phone,cpf_last4,avatar_path&limit=1",accessToken=access))
        if(a.length()==0)throw ApiException(404,"Perfil não encontrado")
        val p=a.getJSONObject(0);val full=p.optString("full_name")
        return ProfileSettings(full,p.optString("display_name").ifBlank{full.substringBefore(" ")},p.optString("email"),p.optString("phone"),p.optString("cpf_last4"),if(p.isNull("avatar_path"))null else p.optString("avatar_path"))
    }

    suspend fun updateDisplayName(access:String,userId:String,displayName:String){
        val encoded=URLEncoder.encode(userId,"UTF-8")
        request("PATCH","/rest/v1/profiles?user_id=eq.$encoded",JSONObject().put("display_name",displayName.trim()),access)
    }

    suspend fun uploadAvatar(access:String,userId:String,bytes:ByteArray,mime:String):String{
        val ext=when(mime.lowercase()){ "image/png"->"png";"image/webp"->"webp";else->"jpg" }
        val path="$userId/avatar_${System.currentTimeMillis()}.$ext"
        uploadObject(path,bytes,mime,access)
        val encoded=URLEncoder.encode(userId,"UTF-8")
        request("PATCH","/rest/v1/profiles?user_id=eq.$encoded",JSONObject().put("avatar_path",path),access)
        return path
    }

    fun avatarPublicUrl(path:String?):String?=path?.takeIf{it.isNotBlank()}?.let{"$base/storage/v1/object/public/profile-avatars/$it"}

    suspend fun listAudit(access:String):List<AuditEntry>{
        val select="id,actor_user_id,action,entity_type,entity_id,details,created_at"
        val a=JSONArray(request("GET","/rest/v1/audit_log?select=${URLEncoder.encode(select,"UTF-8")}&order=created_at.desc&limit=200",accessToken=access))
        return (0 until a.length()).map{i->
            val j=a.getJSONObject(i)
            AuditEntry(j.optLong("id"),if(j.isNull("actor_user_id"))null else j.optString("actor_user_id"),j.optString("action"),j.optString("entity_type"),if(j.isNull("entity_id"))null else j.optString("entity_id"),j.opt("details")?.toString()?:"{}",j.optString("created_at"))
        }
    }
}
