import React, { useState } from 'react';
import { Upload, Activity, Apple, Scale, Flame } from 'lucide-react';

export default function App() {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setReport(null);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) return;

    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', image);

    try {
      const response = await fetch('http://127.0.0.1:8000/predict', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Backend server error. Check if FastAPI is running.');
      const data = await response.json();
      setReport(data);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', backgroundColor: '#f3f4f6', minHeight: '100vh', padding: '30px 20px' }}>
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2rem', margin: '0 0 5px 0', color: '#111827' }}>🍽️ Dietary Estimation Dashboard</h1>
        <p style={{ color: '#4b5563', margin: 0 }}>Upload plate pictures to compute calorie summations instantly</p>
      </header>

      <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: previewUrl ? '1fr 1fr' : '1fr', gap: '20px' }}>
        {/* LEFT COLUMN: UPLOAD */}
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ border: '2px dashed #d1d5db', borderRadius: '8px', padding: '30px', textAlign: 'center', position: 'relative', backgroundColor: '#f9fafb' }}>
              <input type="file" accept="image/*" onChange={handleFileChange} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
              <Upload size={40} color="#9ca3af" style={{ marginBottom: '8px' }} />
              <p style={{ margin: 0, fontWeight: '600' }}>Choose or Drop Food Image</p>
            </div>
            {previewUrl && <img src={previewUrl} alt="Preview" style={{ width: '100%', borderRadius: '8px', maxHeight: '250px', objectFit: 'cover' }} />}
            <button type="submit" disabled={!image || loading} style={{ backgroundColor: '#2563eb', color: '#fff', padding: '12px', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
              {loading ? 'Analyzing Plate Engine...' : 'Calculate Plate Calories'}
            </button>
          </form>
          {error && <div style={{ marginTop: '15px', color: '#b91c1c', backgroundColor: '#fee2e2', padding: '10px', borderRadius: '6px' }}>{error}</div>}
        </div>

        {/* RIGHT COLUMN: CALORIE OUTPUT */}
        {report && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ backgroundColor: '#1e1b4b', color: '#fff', padding: '20px', borderRadius: '12px' }}>
              <h2 style={{ fontSize: '1.2rem', margin: '0 0 15px 0', borderBottom: '1px solid #312e81', paddingBottom: '8px' }}>🔥 Grand Summation</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div style={{ backgroundColor: '#312e81', padding: '12px', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#c7d2fe' }}>TOTAL ENERGY</span>
                  <h3 style={{ margin: '5px 0 0 0', fontSize: '1.4rem' }}>{report.grand_summation.total_calories_kcal} kcal</h3>
                </div>
                <div style={{ backgroundColor: '#312e81', padding: '12px', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#c7d2fe' }}>TOTAL WEIGHT</span>
                  <h3 style={{ margin: '5px 0 0 0', fontSize: '1.4rem' }}>{report.grand_summation.total_weight_g} g</h3>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem' }}>Detected Segments</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {report.individual_items?.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: '#f9fafb', borderRadius: '6px', borderLeft: '4px solid #10b981' }}>
                    <div>
                      <strong style={{ textTransform: 'capitalize' }}>{item.food_name}</strong>
                      <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{item.weight_g}g | P: {item.protein_g}g | F: {item.fat_g}g</div>
                    </div>
                    <span style={{ fontWeight: 'bold', color: '#047457' }}>+{item.calories_kcal} kcal</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}