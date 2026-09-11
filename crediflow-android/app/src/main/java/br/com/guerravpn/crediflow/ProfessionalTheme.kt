package br.com.guerravpn.crediflow

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

/**
 * Tema oficial da CrediFlow 0.6 (Professional).
 * Base visual escolhida: azul corporativo, contraste alto e aparência financeira limpa.
 */
object CrediFlowProfessionalColors {
    val Background = Color(0xFF071426)
    val Surface = Color(0xFF0D2038)
    val SurfaceAlt = Color(0xFF123252)
    val Primary = Color(0xFF147DFF)
    val PrimarySoft = Color(0xFF3D9CFF)
    val Success = Color(0xFF22C55E)
    val Warning = Color(0xFFFFB020)
    val Danger = Color(0xFFFF5C6C)
    val TextPrimary = Color(0xFFF4F8FF)
    val TextSecondary = Color(0xFF9DB3CE)
}

private val ProfessionalColorScheme = darkColorScheme(
    primary = CrediFlowProfessionalColors.Primary,
    secondary = CrediFlowProfessionalColors.PrimarySoft,
    background = CrediFlowProfessionalColors.Background,
    surface = CrediFlowProfessionalColors.Surface,
    surfaceVariant = CrediFlowProfessionalColors.SurfaceAlt,
    onPrimary = Color.White,
    onSecondary = Color.White,
    onBackground = CrediFlowProfessionalColors.TextPrimary,
    onSurface = CrediFlowProfessionalColors.TextPrimary
)

@Composable
fun CrediFlowProfessionalTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = ProfessionalColorScheme,
        content = content
    )
}
