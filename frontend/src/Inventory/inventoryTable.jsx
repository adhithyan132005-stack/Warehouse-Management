import { useEffect, useState } from "react";
import axios from "axios";
import Loading from "./components/Loading"; // Adjust path if needed

export default function InventoryTable() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || ""; // Use env var or empty for relative URL
      const response = await axios.get(`${baseUrl}/api/inventory`, {
        headers: {
          // Include token if present; prepend Bearer if needed
          Authorization: localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : undefined,
        },
      });
      setData(response.data);
    } catch (err) {
      console.error("Error fetching inventory:", err);
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="p-4 text-red-600">
        <p>Unable to load inventory data.</p>
        <pre>{error}</pre>
      </div>
    );
  }

  return (
    <div className="styled-table-wrapper">
      <div style={{ padding: "24px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ fontSize: "1.25rem" }}>Inventory Stock List</h3>
        <span className="badge badge-success">{data.length} Products</span>
      </div>
      <table className="styled-table">
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Location</th>
            <th>Quantity</th>
            <th>Batch</th>
            <th>Expiry</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => {
            const isExpired = item.expiryDate && new Date(item.expiryDate) < new Date();
            return (
              <tr key={item._id}>
                <td>{item.productId?.name}</td>
                <td>{item.locationId ? `${item.locationId.zone}-${item.locationId.rackNumber}` : "N/A"}</td>
                <td>{item.quantity}</td>
                <td>{item.batchNumber}</td>
                <td>{item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : "N/A"}</td>
                <td>
                  <span
                    className={`badge ${
                      isExpired
                        ? "badge-danger"
                        : item.quantity < 10
                        ? "badge-warning"
                        : "badge-success"
                    }`}
                  >
                    {isExpired ? "Expired ❌" : item.quantity < 10 ? "Low Stock ⚠️" : "Good ✅"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
