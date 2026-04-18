import { useEffect, useState } from "react"
import axios from "axios"

export default function Users() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            const response = await axios.get("https://warehouse-management-backend-t3q2.onrender.com/api/users", {
                headers: { authorization: localStorage.getItem('token') }
            })
            setUsers(response.data)
        } catch (err) {
            setError("Failed to load users")
            console.log(err)
        } finally {
            setLoading(false)
        }
    }

    const updateRole = async (userId, newRole) => {
        try {
            await axios.put(`https://warehouse-management-backend-t3q2.onrender.com/api/users/${userId}/role`, { role: newRole }, {
                headers: { authorization: localStorage.getItem('token') }
            })
            fetchUsers() // Refresh list
        } catch (err) {
            alert("Failed to update role")
            console.log(err)
        }
    }

    if (loading) return <div>Loading users...</div>
    if (error) return <div className="text-danger">{error}</div>

    return (
        <div>
            <h2>User Management</h2>
            <p>Manage user roles (admin can set users to staff)</p>
            <table className="styled-table text-slate-950 bg-white">
                <thead>
                    <tr>
                        <th className="text-slate-950">Username</th>
                        <th className="text-slate-950">Email</th>
                        <th className="text-slate-950">Current Role</th>
                        <th className="text-slate-950">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user._id}>
                            <td>{user.username}</td>
                            <td>{user.email}</td>
                            <td>{user.role}</td>
                            <td>
                                {user.role !== 'admin' && (
                                    <select
                                        value={user.role}
                                        onChange={(e) => updateRole(user._id, e.target.value)}
                                    >
                                        <option value="user">User</option>
                                        <option value="staff">Staff</option>
                                    </select>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
