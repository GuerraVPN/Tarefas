package br.com.guerravpn.crediflow

/**
 * Compatibilidade temporária enquanto as classes Kotlin ainda estão no pacote legado.
 * O applicationId/namespace público do app 0.7 já é br.com.guerravpn.crediflow.app.
 */
object BuildConfig {
    const val SUPABASE_URL: String = br.com.guerravpn.crediflow.app.BuildConfig.SUPABASE_URL
    const val SUPABASE_PUBLISHABLE_KEY: String = br.com.guerravpn.crediflow.app.BuildConfig.SUPABASE_PUBLISHABLE_KEY
}
