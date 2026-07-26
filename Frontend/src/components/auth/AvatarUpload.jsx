import React, { useState } from 'react'
import axiosInstance from '../../api/axiosInstance';
import useAuthStore from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

function AvatarUpload() {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const navigate =useNavigate();
    const user = useAuthStore((state) => state.user);

     const setUser = useAuthStore((state) => state.setUser);

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        setFile(selected);
        setPreview(URL.createObjectURL(selected));
    };

    const handleUpload = async () => {
        setUploading(true);
        setError('');
        try {
            const formData = new FormData();
            formData.append('avatar', file);

            const res = await axiosInstance.post('/auth/upload-avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

           

            setUser(res.data.user);

        } catch (err) {
            setError(err.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleLogout = async () => {
      localStorage.removeItem("token")
      setUser(null);
      navigate("/login")
    }


    return (
  <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-xl shadow-md max-w-sm mx-auto">
    <img
      src={preview || user?.avatar?.url || '/default-item.png'}
      alt="Avatar"
      className="w-28 h-28 rounded-full object-cover border-4 border-gray-200"
    />

    <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition">
      Choose Photo
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </label>

    <button
      onClick={handleUpload}
      disabled={!file || uploading}
      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium px-6 py-2 rounded-lg transition"
    >
      {uploading ? 'Uploading...' : 'Upload Avatar'}
    </button>

    <button onClick={handleLogout} className='text-xl rounded bg-red-700 p-2 text-blue-50'>
      Logout
      
    </button>

    {error && <p className="text-red-500 text-sm">{error}</p>}
  </div>
);
}

export default AvatarUpload
