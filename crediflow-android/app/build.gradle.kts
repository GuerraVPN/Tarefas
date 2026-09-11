import java.io.File

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.plugin.compose")
}

android {
    namespace = "br.com.guerravpn.crediflow"
    compileSdk = 36

    defaultConfig {
        applicationId = "br.com.guerravpn.crediflow"
        minSdk = 26
        targetSdk = 36
        versionCode = 1
        versionName = "0.1"

        buildConfigField("String", "SUPABASE_URL", "\"https://xvhbydoslqmnjjsnyvus.supabase.co\"")
        buildConfigField("String", "SUPABASE_PUBLISHABLE_KEY", "\"sb_publishable_uFIWm1dNBbbJqoxuy5aBLQ_QqtSJeya\"")
    }

    val signingPath = System.getenv("CREDIFLOW_KEYSTORE_PATH")
    val signingPassword = System.getenv("CREDIFLOW_KEYSTORE_PASSWORD")
    val signingAlias = System.getenv("CREDIFLOW_KEY_ALIAS") ?: "alias"
    val signingKeyPassword = System.getenv("CREDIFLOW_KEY_PASSWORD")
    val hasReleaseSigning = !signingPath.isNullOrBlank()
            && !signingPassword.isNullOrBlank()
            && !signingKeyPassword.isNullOrBlank()
            && File(signingPath).exists()

    signingConfigs {
        if (hasReleaseSigning) {
            create("tarefasCertificate") {
                storeFile = file(signingPath!!)
                storePassword = signingPassword
                keyAlias = signingAlias
                keyPassword = signingKeyPassword
            }
        }
    }

    buildTypes {
        debug {
            applicationIdSuffix = ".debug"
            versionNameSuffix = "-debug"
        }
        release {
            isMinifyEnabled = false
            if (hasReleaseSigning) signingConfig = signingConfigs.getByName("tarefasCertificate")
        }
    }

    buildFeatures {
        compose = true
        buildConfig = true
    }

    packaging {
        resources { excludes += "/META-INF/{AL2.0,LGPL2.1}" }
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.17.0")
    implementation("androidx.activity:activity-compose:1.10.1")
    implementation("androidx.compose.ui:ui:1.12.1")
    implementation("androidx.compose.ui:ui-tooling-preview:1.12.1")
    implementation("androidx.compose.foundation:foundation:1.12.1")
    implementation("androidx.compose.material3:material3:1.4.0")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.10.2")
    debugImplementation("androidx.compose.ui:ui-tooling:1.12.1")
}
