import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import ClientForm from "../components/ClientForm";
import axios from "../utils/AxiosInstance";
import { useAuth } from "../utils/AuthProvider";

interface ClientDetail {
  id: number;
  client_name: string;
  email: string;
  phone_no: string;
  company: string;
  meta: {
    createdAt: string;
    updatedAt: string;
  };
}

// Fetch detail client
export const fetchClientDetail = async (id: string | undefined, token: string | null) => {
  return await axios.get(`/api/client/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

// Update client
const updateClient = async (id: string | undefined, data: any, token: string | null) => {
  return await axios.put(`/api/client/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

// Delete client
const deleteClient = async (id: string | undefined, token: string | null) => {
  return await axios.delete(`/api/client/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

const ClientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Query detail client
  const { data: clientDetail, isLoading, isError } = useQuery({
    queryKey: ["clientDetail", id],
    queryFn: () => fetchClientDetail(id, getToken()),
    refetchOnWindowFocus: false,
    refetchInterval: false
  });

  // Mutation update client
  const updateClientMutation = useMutation({
    mutationFn: (data: any) => updateClient(id, data, getToken()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientList"] });
      navigate("/clients", { replace: true });
    }
  });

  // Mutation hapus client
  const deleteClientMutation = useMutation({
    mutationFn: () => deleteClient(id, getToken()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientList"] });
      navigate("/clients", { replace: true });
    }
  });

  // Delete confirmation modal
  const DeleteConfirmationModal = () => {
    if (!isDeleteModalOpen) return null;
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
          <h3 className="text-lg font-medium mb-3">Delete Confirmation</h3>
          <p className="text-gray-600 mb-4">
            Are you sure you want to delete this client? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                deleteClientMutation.mutate();
                setIsDeleteModalOpen(false);
              }}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const isAnyLoading = isLoading || updateClientMutation.isPending || deleteClientMutation.isPending;

  return (
    <div className="flex justify-center items-center min-h-[80vh] bg-[#f7fafd]">
      <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-lg p-8 border-2 border-purple-300">
        <h2 className="text-2xl font-bold text-center mb-6">Edit Client</h2>
        {isAnyLoading && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10 rounded-lg">
            <span className="text-lg text-gray-700">Loading...</span>
          </div>
        )}
        <DeleteConfirmationModal />
        {isError && (
          <div className="text-red-500 mb-4">Failed to load client. Please try again.</div>
        )}
        {!isError && (!clientDetail || !clientDetail.data) && (
          <div className="text-gray-500 text-center py-8">Client data not found or still loading.<br/>Please check your connection or API.</div>
        )}
        {!isError && clientDetail && clientDetail.data && (
          <>
            <ClientForm
              onSubmit={updateClientMutation.mutate}
              initialData={clientDetail.data}
              showDeleteButton={true}
              onDelete={handleDelete}
            />
            {updateClientMutation.isError && (
              <div className="text-red-500 mt-4">
                Error while saving: {updateClientMutation.error?.message || "Unknown error"}
              </div>
            )}
            {deleteClientMutation.isError && (
              <div className="text-red-500 mt-4">
                Error while deleting: {deleteClientMutation.error?.message || "Unknown error"}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ClientDetail;
