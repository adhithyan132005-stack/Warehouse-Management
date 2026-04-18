import { useEffect, useState } from "react"
import axios from "axios"

export default function Settings() {
    const [user, setUser] = useState(null)
    const [editing, setEditing] = useState(false)
    const [formData, setFormData] = useState({ name: "", email: "" })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState("")

    useEffect(() => {
        fetchUser()
    }, [])

    const fetchUser = async () => {
        try {
            const token = localStorage.getItem("token")
            const response = await axios.get("http://localhost:4444/api/account", {
                headers: { Authorization: `Bearer ${token}` }
            })
            setUser(response.data)
            setFormData({ username: response.data.username || "", email: response.data.email || "" })
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        setMessage("")
        try {
            const token = localStorage.getItem("token")
            await axios.put("http://localhost:4444/api/account", formData, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setMessage("Profile updated successfully! ✅")
            setEditing(false)
            localStorage.setItem("userName", formData.username)
            fetchUser()
        } catch (err) {
            setMessage("Error updating profile ❌")
            console.error(err)
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <p style={{ color: "#64748b", marginTop: 16 }}>Loading your profile...</p>
            </div>
        )
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>⚙️ Settings</h2>
                <p style={styles.subtitle}>Manage your account information</p>
            </div>

            {/* Profile Card */}
            <div style={styles.profileCard}>
                <div style={styles.avatarSection}>
                    <div style={styles.avatar}>
                        {(user?.username || "U")[0].toUpperCase()}
                    </div>
                    <div>
                        <h3 style={styles.userName}>{user?.username || "User"}</h3>
                        <span style={styles.roleBadge}>{user?.role || "user"}</span>
                    </div>
                </div>

                <div style={styles.divider}></div>

                {message && (
                    <div style={{
                        ...styles.messageBox,
                        background: message.includes("✅") ? "#f0fdf4" : "#fef2f2",
                        color: message.includes("✅") ? "#16a34a" : "#dc2626",
                        borderColor: message.includes("✅") ? "#bbf7d0" : "#fecaca",
                    }}>
                        {message}
                    </div>
                )}

                {/* Info Rows */}
                <div style={styles.infoSection}>
                    <div style={styles.infoRow}>
                        <span style={styles.infoLabel}>👤 Full Name</span>
                        {editing ? (
                            <input
                                style={styles.input}
                                value={formData.username}
                                onChange={e => setFormData({ ...formData, username: e.target.value })}
                            />
                        ) : (
                            <span style={styles.infoValue}>{user?.username || "—"}</span>
                        )}
                    </div>

                    <div style={styles.infoRow}>
                        <span style={styles.infoLabel}>📧 Email</span>
                        {editing ? (
                            <input
                                style={styles.input}
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        ) : (
                            <span style={styles.infoValue}>{user?.email || "—"}</span>
                        )}
                    </div>

                    <div style={styles.infoRow}>
                        <span style={styles.infoLabel}>🔑 Role</span>
                        <span style={styles.infoValue}>{user?.role || "user"}</span>
                    </div>

                    <div style={styles.infoRow}>
                        <span style={styles.infoLabel}>📅 Joined</span>
                        <span style={styles.infoValue}>
                            {user?.createdAt
                                ? new Date(user.createdAt).toLocaleDateString("en-US", {
                                    year: "numeric", month: "long", day: "numeric"
                                })
                                : "—"
                            }
                        </span>
                    </div>
                </div>

                <div style={styles.divider}></div>

                {/* Buttons */}
                <div style={styles.buttonRow}>
                    {editing ? (
                        <>
                            <button
                                style={styles.saveBtn}
                                onClick={handleSave}
                                disabled={saving}
                            >
                                {saving ? "Saving..." : "💾 Save Changes"}
                            </button>
                            <button
                                style={styles.cancelBtn}
                                onClick={() => {
                                    setEditing(false)
                                    setFormData({ username: user?.username || "", email: user?.email || "" })
                                    setMessage("")
                                }}
                            >
                                Cancel
                            </button>
                        </>
                    ) : (
                        <button
                            style={styles.editBtn}
                            onClick={() => setEditing(true)}
                        >
                            ✏️ Edit Profile
                        </button>
                    )}
                </div>
            </div>

            {/* Account Stats */}
            <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                    <span style={styles.statIcon}>📦</span>
                    <span style={styles.statLabel}>Account Type</span>
                    <span style={styles.statValue}>{user?.role === "admin" ? "Administrator" : user?.role === "staff" ? "Staff Member" : "Customer"}</span>
                </div>
                <div style={styles.statCard}>
                    <span style={styles.statIcon}>🔐</span>
                    <span style={styles.statLabel}>Security</span>
                    <span style={styles.statValue}>Password Protected</span>
                </div>
                <div style={styles.statCard}>
                    <span style={styles.statIcon}>🌐</span>
                    <span style={styles.statLabel}>Status</span>
                    <span style={{ ...styles.statValue, color: "#16a34a" }}>Active</span>
                </div>
            </div>
        </div>
    )
}

const styles = {
    container: {
        maxWidth: 700,
        margin: "0 auto",
        padding: "20px",
    },
    loadingContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
    },
    spinner: {
        width: 40,
        height: 40,
        border: "4px solid #e2e8f0",
        borderTopColor: "#00A19B",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
    },
    header: {
        marginBottom: 28,
    },
    title: {
        margin: 0,
        fontSize: "1.8rem",
        fontWeight: 800,
        color: "#0f172a",
    },
    subtitle: {
        margin: "4px 0 0",
        color: "#64748b",
        fontSize: "0.95rem",
    },
    profileCard: {
        background: "#ffffff",
        borderRadius: 20,
        border: "1px solid #e2e8f0",
        padding: 32,
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
        marginBottom: 24,
    },
    avatarSection: {
        display: "flex",
        alignItems: "center",
        gap: 20,
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #00A19B 0%, #04715e 100%)",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1.8rem",
        fontWeight: 800,
        boxShadow: "0 4px 16px rgba(0, 161, 155, 0.3)",
    },
    userName: {
        margin: 0,
        fontSize: "1.3rem",
        fontWeight: 700,
        color: "#0f172a",
    },
    roleBadge: {
        display: "inline-block",
        background: "#f0fdf4",
        color: "#16a34a",
        padding: "2px 10px",
        borderRadius: 20,
        fontSize: "0.75rem",
        fontWeight: 600,
        textTransform: "uppercase",
        marginTop: 4,
    },
    divider: {
        height: 1,
        background: "#e2e8f0",
        margin: "24px 0",
    },
    messageBox: {
        padding: "10px 16px",
        borderRadius: 10,
        marginBottom: 16,
        fontWeight: 600,
        fontSize: "0.9rem",
        border: "1px solid",
    },
    infoSection: {
        display: "flex",
        flexDirection: "column",
        gap: 16,
    },
    infoRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 0",
    },
    infoLabel: {
        fontSize: "0.9rem",
        fontWeight: 600,
        color: "#475569",
        minWidth: 140,
    },
    infoValue: {
        fontSize: "0.95rem",
        color: "#0f172a",
        fontWeight: 500,
    },
    input: {
        padding: "8px 14px",
        borderRadius: 10,
        border: "1.5px solid #e2e8f0",
        fontSize: "0.95rem",
        color: "#0f172a",
        background: "#f8fafc",
        outline: "none",
        width: 260,
    },
    buttonRow: {
        display: "flex",
        gap: 12,
    },
    editBtn: {
        padding: "12px 24px",
        borderRadius: 12,
        border: "none",
        background: "linear-gradient(135deg, #00A19B 0%, #04715e 100%)",
        color: "#fff",
        fontWeight: 700,
        fontSize: "0.95rem",
        cursor: "pointer",
        boxShadow: "0 4px 16px rgba(0, 161, 155, 0.3)",
    },
    saveBtn: {
        padding: "12px 24px",
        borderRadius: 12,
        border: "none",
        background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        color: "#fff",
        fontWeight: 700,
        fontSize: "0.95rem",
        cursor: "pointer",
    },
    cancelBtn: {
        padding: "12px 24px",
        borderRadius: 12,
        border: "1px solid #e2e8f0",
        background: "#f8fafc",
        color: "#475569",
        fontWeight: 600,
        fontSize: "0.95rem",
        cursor: "pointer",
    },
    statsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 16,
    },
    statCard: {
        background: "#ffffff",
        borderRadius: 16,
        border: "1px solid #e2e8f0",
        padding: "20px 16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
    },
    statIcon: {
        fontSize: "1.5rem",
    },
    statLabel: {
        fontSize: "0.75rem",
        color: "#94a3b8",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
    },
    statValue: {
        fontSize: "0.9rem",
        color: "#0f172a",
        fontWeight: 700,
    },
}
