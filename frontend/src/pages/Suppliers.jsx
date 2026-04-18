import { useEffect, useState } from "react"
import axios from "axios"

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await axios.get("https://warehouse-management-backend-t3q2.onrender.com/api/suppliers", {
          headers: { authorization: localStorage.getItem('token') }
        })
        setSuppliers(response.data)
      } catch (err) {
        setError("Unable to load suppliers")
      } finally {
        setLoading(false)
      }
    }

    fetchSuppliers()
  }, [])

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in p-4 lg:p-8">
      <header className="glass-card rounded-[28px] p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Supplier management</p>
          <h1 className="text-3xl font-extrabold text-white mt-3">Supplier Directory</h1>
          <p className="mt-2 text-slate-400 max-w-2xl">Track vendor contacts, shipping partners, and supplier locations in one modern workspace.</p>
        </div>
      </header>

      <div className="glass-card rounded-[28px] border border-white/10 shadow-soft overflow-hidden">
        <div className="p-6 border-b border-white/10 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Supplier table</h2>
            <p className="text-slate-400 text-sm">Secure vendor information and contact details.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button className="btn-primary px-5 py-3">Add Supplier</button>
            <button className="bg-slate-900/80 text-slate-300 border border-white/10 rounded-2xl px-5 py-3 hover:bg-slate-800 transition">Export CSV</button>
          </div>
        </div>

        <div className="overflow-x-auto p-2">
          <table className="min-w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-xs tracking-[0.18em]">
              <tr>
                <th className="px-6 py-4">Supplier</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">Loading suppliers...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-rose-400">{error}</td>
                </tr>
              ) : suppliers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">No suppliers available yet.</td>
                </tr>
              ) : (
                suppliers.map((supplier) => (
                  <tr key={supplier._id} className="hover:bg-slate-900/80 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-white">{supplier.name}</p>
                      <p className="text-slate-500 text-xs mt-1">{supplier.company || 'Vendor'}</p>
                    </td>
                    <td className="px-6 py-4">{supplier.email || 'n/a'}</td>
                    <td className="px-6 py-4">{supplier.phone || 'n/a'}</td>
                    <td className="px-6 py-4">{supplier.address || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className="badge-pill bg-emerald-500/15 text-emerald-300 border border-emerald-500/15">Active</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
