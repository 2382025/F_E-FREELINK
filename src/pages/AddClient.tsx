import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import axios from "../utils/AxiosInstance";
import { useEffect } from "react";
import { useAuth } from "../utils/AuthProvider";

// Ganti nama fungsi dan endpoint-nya untuk menambahkan client
const addClient = async (data: { client_name: string; email: string; phone_no: string; company: string }, token: string | null) => {
  if (!token) {
    throw new Error("No authentication token found");
  }
  return await axios.post("/api/client", data, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

const AddClient = () => {
  const { getToken } = useAuth();
  const { mutate, isSuccess, isPending } = useMutation({
    mutationFn: (data: { client_name: string; email: string; phone_no: string; company: string }) => addClient(data, getToken()),
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (isSuccess) {
      navigate("/clients", { replace: true }); // Navigasi ke halaman daftar client setelah berhasil
    }
  }, [isSuccess, navigate]);

  return (
    <div className="relative">
      {isPending && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
          <div className="flex items-center bg-white/90 px-6 py-3 rounded-lg shadow-lg">
            <span className="text-2xl mr-4 text-gray-800">Adding...</span>
            <svg
              className="animate-spin h-5 w-5 text-gray-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        </div>
      )}
      <h2 className="text-2xl font-bold mb-6 mt-10">Add Client</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);
          const data = {
            client_name: formData.get("client_name") as string,
            email: formData.get("email") as string,
            phone_no: formData.get("phone_no") as string,
            company: formData.get("company") as string,
          };
          mutate(data); // Kirim data ke backend untuk ditambahkan
        }}
        className="space-y-6"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700">Client Name</label>
          <input
            type="text"
            name="client_name"
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Phone Number</label>
          <input
            type="text"
            name="phone_no"
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Company</label>
          <input
            type="text"
            name="company"
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add Client
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddClient;
