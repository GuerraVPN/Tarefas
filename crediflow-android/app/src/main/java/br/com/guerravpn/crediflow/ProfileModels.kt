package br.com.guerravpn.crediflow

data class ProfileSettings(
    val fullName: String,
    val displayName: String,
    val email: String,
    val phone: String,
    val cpfLast4: String,
    val avatarPath: String?
)

data class AuditEntry(
    val id: Long,
    val actorUserId: String?,
    val action: String,
    val entityType: String,
    val entityId: String?,
    val details: String,
    val createdAt: String
)
