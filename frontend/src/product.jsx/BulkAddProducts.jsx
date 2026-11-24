import { useState, useEffect } from 'react';
import axios from 'axios';

const BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:4444'
    : 'https://warehouse-management-backend-t3q2.onrender.com';

export default function BulkAddProducts() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [products, setProducts] = useState([
    { name: '', sku: '', price: '', imageFile: null, preview: null, error: '' },
  ]);
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');

  useEffect(() => {
    // fetch categories from backend (assuming endpoint exists)
    axios
      .get(`${BASE_URL}/api/category`)
      .then((res) => setCategories(res.data))
      .catch(() => setCategories([]));
  }, []);

  const handleAddRow = () => {
    setProducts((prev) => [
      ...prev,
      { name: '', sku: '', price: '', imageFile: null, preview: null, error: '' },
    ]);
  };

  const handleChange = (index, field, value) => {
    setProducts((prev) => {
      const copy = [...prev];
      copy[index][field] = value;
      return copy;
    });
  };

  const handleImageChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      handleChange(index, 'imageFile', file);
      handleChange(index, 'preview', URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCategory) {
      setGlobalError('Please select a category.');
      return;
    }
    setGlobalError('');
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      for (const prod of products) {
        if (!prod.name || !prod.sku || !prod.price) continue; // skip empty rows
        const formData = new FormData();
        formData.append('name', prod.name);
        formData.append('sku', prod.sku);
        formData.append('category', selectedCategory);
        formData.append('price', prod.price);
        if (prod.imageFile) formData.append('image', prod.imageFile);
        await axios.post(`${BASE_URL}/api/product`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      // Reset after success
      setProducts([
        { name: '', sku: '', price: '', imageFile: null, preview: null, error: '' },
      ]);
      setSelectedCategory('');
    } catch (err) {
      setGlobalError(err.response?.data?.error || 'Failed to add products.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 glass-card rounded-2xl">
      <h2 className="text-2xl font-bold mb-4">Bulk Add Products</h2>
      {globalError && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{globalError}</div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Category *</label>
          <select
            className="w-full border rounded p-2"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">-- Select Category --</option>
            {categories.map((c) => (
              <option key={c._id} value={c.name}> {c.name} </option>
            ))}
          </select>
        </div>
        {products.map((p, idx) => (
          <div key={idx} className="grid grid-cols-5 gap-4 items-start border-b pb-4 mb-4">
            <div>
              <label className="block mb-1 font-medium">Name *</label>
              <input
                className="w-full border rounded p-2"
                value={p.name}
                onChange={(e) => handleChange(idx, 'name', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">SKU *</label>
              <input
                className="w-full border rounded p-2"
                value={p.sku}
                onChange={(e) => handleChange(idx, 'sku', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Price *</label>
              <input
                type="number"
                className="w-full border rounded p-2"
                value={p.price}
                onChange={(e) => handleChange(idx, 'price', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Image (optional)</label>
              <input type="file" accept="image/*" onChange={(e) => handleImageChange(idx, e)} />
              {p.preview && (
                <img src={p.preview} alt="preview" className="mt-2 w-20 h-20 object-cover rounded" />
              )}
            </div>
            <div className="flex items-center pt-6">
              <button
                type="button"
                onClick={() => setProducts((prev) => prev.filter((_, i) => i !== idx))}
                className="text-red-600 hover:underline"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddRow}
          className="bg-indigo-600 text-white px-4 py-2 rounded"
        >
          Add Another Product
        </button>
        <div>
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white px-6 py-2 rounded"
          >
            {loading ? 'Saving...' : 'Save All'}
          </button>
        </div>
      </form>
    </div>
  );
}
