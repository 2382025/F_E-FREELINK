import axios from 'axios';

// Buat instance axios dengan konfigurasi yang benar
const axiosInstance = axios.create({
  // Pastikan baseURL diawali dengan http:// atau https:// dan berakhir tanpa slash
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // timeout opsional (dalam ms)
});

// Opsional: Tambahkan interceptor untuk penanganan error
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 404) {
      console.error('Resource tidak ditemukan:', error.config.url);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;