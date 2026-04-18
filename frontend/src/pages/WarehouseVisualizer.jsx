import { useState, useEffect } from "react";
import axios from "axios";
import "./WarehouseVisualizer.css";

export default function WarehouseVisualizer() {
  const [locations, setLocations] = useState([]);
  const [zones, setZones] = useState({});
  const [selectedRack, setSelectedRack] = useState(null);
  const [rackProducts, setRackProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all warehouse locations
  const fetchLocations = async () => {
    try {
      const response = await axios.get("https://warehouse-management-backend-t3q2.onrender.com/api/locations", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      
      const locs = response.data;
      
      // Group by Zone
      const grouped = {};
      locs.forEach((loc) => {
        if (!grouped[loc.zone]) {
          grouped[loc.zone] = [];
        }
        grouped[loc.zone].push(loc);
      });
      
      setZones(grouped);
    } catch (err) {
      console.error(err);
      setError("Failed to load warehouse layout.");
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  // Handle clicking a rack
  const handleRackClick = async (rack) => {
    setSelectedRack(rack);
    setLoadingProducts(true);
    setRackProducts([]);
    
    try {
      const response = await axios.get(`https://warehouse-management-backend-t3q2.onrender.com/api/inventory/location/${rack._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setRackProducts(response.data);
    } catch (err) {
      console.error(err);
      setRackProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const closeModal = () => {
    setSelectedRack(null);
    setRackProducts([]);
  };

  // Determine color/status of a rack based on capacity (if available)
  const getRackStatusClass = (rack) => {
    // If we have totalQty mapped, we can use it. The location API we saw earlier returns totalQty.
    const capacity = rack.capacity || 100;
    const qty = rack.totalQty || 0;
    const fillPercentage = (qty / capacity) * 100;

    if (qty === 0) return "rack-empty";
    if (fillPercentage > 80) return "rack-full";
    return "rack-partial";
  };

  return (
    <div className="w-full min-h-full flex flex-col p-4">
      <div className="text-center mb-8 relative z-10">
        <h2 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 mb-2">3D Warehouse Layout</h2>
        <p className="text-gray-400 text-lg">Interactive Isometric Overview. Click on a rack to view stored products.</p>
        <div className="flex justify-center gap-8 mt-6">
          <span className="flex items-center gap-2 text-sm text-gray-400"><div className="w-4 h-4 rounded bg-emerald-500/20 border border-emerald-500"></div> Empty</span>
          <span className="flex items-center gap-2 text-sm text-gray-400"><div className="w-4 h-4 rounded bg-teal-500/20 border border-teal-500"></div> Partial</span>
          <span className="flex items-center gap-2 text-sm text-gray-400"><div className="w-4 h-4 rounded bg-rose-500/20 border border-rose-500"></div> Full/Near Full</span>
        </div>
      </div>

      {error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="isometric-world-container">
          <div className="isometric-world">
            {Object.keys(zones).map((zoneName, zIndex) => (
              <div className="isometric-zone" key={zoneName} style={{ transform: `translateZ(${zIndex * 10}px)` }}>
                <div className="zone-label">Zone {zoneName}</div>
                <div className="rack-grid">
                  {zones[zoneName].map((rack) => (
                    <div 
                      key={rack._id} 
                      className={`isometric-rack ${getRackStatusClass(rack)} ${selectedRack?._id === rack._id ? 'selected' : ''}`}
                      onClick={() => handleRackClick(rack)}
                    >
                      <div className="rack-face top"></div>
                      <div className="rack-face left"></div>
                      <div className="rack-face right">
                        <span className="rack-id">{rack.rackNumber}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedRack && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center animate-in fade-in duration-300" onClick={closeModal}>
          <div className="bg-gray-900/80 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl w-11/12 max-w-lg max-h-[85vh] flex flex-col relative animate-in slide-in-from-bottom-8 duration-500 zoom-in-95" onClick={(e) => e.stopPropagation()}>
            <button className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors text-2xl z-10" onClick={closeModal}>&times;</button>
            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-white m-0">Rack: {selectedRack.rackNumber}</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-bold text-white ${getRackStatusClass(selectedRack)} bg-opacity-30 border`}>
                Zone {selectedRack.zone}
              </span>
            </div>
            
            <div className="p-8 overflow-y-auto custom-scrollbar">
              <div className="mb-8 bg-black/20 p-4 rounded-xl border border-white/5">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Capacity Tracker</span>
                  <span className="font-mono text-cyan-400">{selectedRack.totalQty || 0} / {selectedRack.capacity || 100}</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${Math.min(((selectedRack.totalQty || 0) / (selectedRack.capacity || 100)) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              <h4 className="text-gray-300 text-lg font-semibold mb-4">Products Inside</h4>
              {loadingProducts ? (
                <div className="flex flex-col items-center py-8 text-gray-400">
                  <div className="w-8 h-8 rounded-full border-4 border-white/10 border-t-cyan-400 animate-spin mb-4"></div>
                  <p>Interrogating database...</p>
                </div>
              ) : rackProducts.length === 0 ? (
                <div className="text-center py-8 bg-white/5 rounded-xl text-gray-400 border border-white/5">
                  <p>🏜️ No products stored in this rack.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {rackProducts.map((item) => (
                    <div key={item._id} className="flex items-center bg-white/5 p-4 rounded-xl border border-white/5 hover:bg-white/10 hover:border-purple-500/30 hover:shadow-lg transition-all hover:-translate-y-1 group">
                      <div className="text-3xl mr-4 bg-white/10 w-12 h-12 flex justify-center items-center rounded-xl group-hover:scale-110 transition-transform">📦</div>
                      <div className="flex-1">
                        <div className="font-semibold text-white text-lg">{item.productId?.name || "Unknown Product"}</div>
                        <div className="text-xs text-gray-400 mt-1">Batch: {item.batchNumber || "N/A"} | SKU: {item.productId?.sku}</div>
                      </div>
                      <div className="flex flex-col items-end bg-black/30 px-4 py-2 rounded-lg">
                        <span className="font-black text-xl text-cyan-400">{item.quantity}</span>
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">QTY</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
