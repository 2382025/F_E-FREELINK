import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ClientForm from "../components/ClientForm";
import axios from "../utils/AxiosInstance";
import { fetchClientDetail } from "./ClientDetail";
import { useAuth } from "../utils/AuthProvider";

interface ClientFormData {
  client_name: string;
  email: string;
  phone_no: string;
  company: string;
}

const editClient = async (data: ClientFormData, id: string | undefined, token: string | null) => {
  try {
    return await axios.put(`/api/client/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch (error) {
    console.error("Error editing client:", error);
    throw error;
  }
};

const EditClient = () => {
  const { getToken } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const { mutate, isSuccess, isPending, error } = useMutation({
    mutationFn: (data: ClientFormData) => editClient(data, id, getToken()),
  });

  const getClientDetail = useQuery({
    queryKey: ["clientDetail", id],
    queryFn: () => fetchClientDetail(id, getToken()),
    enabled: !!id
  });

  useEffect(() => {
    if (isSuccess) {
      navigate("/clients", { replace: true });
    }
  }, [isSuccess, navigate]);

  return (
    <div className="relative">
      {(isPending || getClientDetail.isFetching) && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
          <div className="flex items-center bg-white/90 px-6 py-3 rounded-lg shadow-lg">
            <span className="text-2xl mr-4 text-gray-800">Loading...</span>
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

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error instanceof Error ? error.message : 'Failed to update client'}
        </div>
      )}

      {getClientDetail.data?.data && (
        <ClientForm
          onSubmit={mutate}
          initialData={getClientDetail.data.data}
          showDeleteButton={true}
          onDelete={() => {
            if (window.confirm('Are you sure you want to delete this client?')) {
              // Implement delete functionality here
            }
          }}
        />
      )}
    </div>
  );
};

export default EditClient;
