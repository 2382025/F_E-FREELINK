import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import InvoiceForm, { InvoiceFormInput } from "../components/InvoiceForm";
import axios from "../utils/AxiosInstance";
import { useAuth } from "../utils/AuthProvider";

// Fetch detail invoice
export const fetchInvoiceDetail = async (id: string | undefined, token: string | null) => {
  return await axios.get(`/api/invoice/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

// Fetch project list
const fetchProjectList = async (token: string | null) => {
  return await axios.get(`/api/project`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

// Fetch client list
const fetchClientList = async (token: string | null) => {
  return await axios.get(`/api/client`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

// Update invoice
const updateInvoice = async (id: string | undefined, data: InvoiceFormInput, token: string | null) => {
  const payload = {
    project_id: data.projectId,
    client_id: data.clientId,
    amount: data.amount,
    payment_method: data.paymentMethod,
    payment_status: data.status,
    issue_date: data.issueDate
  };
  console.log('Payload update invoice:', payload);
  try {
    return await axios.put(`/api/invoice/${id}`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch (err) {
    console.error('Error update invoice:', err instanceof Error ? err.message : err);
    throw err;
  }
};

// Delete invoice
const deleteInvoice = async (id: string | undefined, token: string | null) => {
  return await axios.delete(`/api/invoice/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Query detail invoice
  const { data: invoiceDetail, isLoading, isError } = useQuery({
    queryKey: ["invoiceDetail", id],
    queryFn: () => fetchInvoiceDetail(id, getToken()),
    refetchOnWindowFocus: false,
    refetchInterval: false
  });

  // Query project list
  const { data: projectList } = useQuery({
    queryKey: ["projectList"],
    queryFn: () => fetchProjectList(getToken()),
  });

  // Query client list
  const { data: clientList } = useQuery({
    queryKey: ["clientList"],
    queryFn: () => fetchClientList(getToken()),
  });

  // Mutation update invoice
  const updateInvoiceMutation = useMutation({
    mutationFn: (data: InvoiceFormInput) => updateInvoice(id, data, getToken()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoiceList"] });
      navigate("/invoices", { replace: true });
    }
  });

  // Mutation hapus invoice
  const deleteInvoiceMutation = useMutation({
    mutationFn: () => deleteInvoice(id, getToken()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoiceList"] });
      navigate("/invoices", { replace: true });
    }
  });

  // Modal konfirmasi hapus
  const DeleteConfirmationModal = () => {
    if (!isDeleteModalOpen) return null;
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
          <h3 className="text-lg font-medium mb-3">Confirm Delete</h3>
          <p className="text-gray-600 mb-4">
            Are You Sure You Want To Delete This Invoice?.
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
                deleteInvoiceMutation.mutate();
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

  const isAnyLoading = isLoading || updateInvoiceMutation.isPending || deleteInvoiceMutation.isPending;

  // Mapping data invoice dari API ke struktur InvoiceFormInput
  let defaultInputData: InvoiceFormInput | undefined = undefined;
  if (invoiceDetail && invoiceDetail.data) {
    defaultInputData = {
      projectId: invoiceDetail.data.project?.id ||"",
      clientId: invoiceDetail.data.client?.id ||"",
      amount: invoiceDetail.data.amount,
      paymentMethod: invoiceDetail.data.payment_method || "",
      status: invoiceDetail.data.payment_status || "",
      issueDate: invoiceDetail.data.issue_date ? invoiceDetail.data.issue_date.slice(0, 10) : ""
    };
  }

  return (
    <div className="flex justify-center items-center min-h-[80vh] bg-[#f7fafd]">
      <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-lg p-8 border-2 border-purple-300">
        <h2 className="text-2xl font-bold text-center mb-6">Edit Invoice</h2>
        {isAnyLoading && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10 rounded-lg">
            <span className="text-lg text-gray-700">Loading...</span>
          </div>
        )}
        <DeleteConfirmationModal />
        {isError && (
          <div className="text-red-500 mb-4">Error Loading Invoice, Try Again Later.</div>
        )}
        {!isError && (!invoiceDetail || !invoiceDetail.data || !projectList || !clientList) && (
          <div className="text-gray-500 text-center py-8">Data invoice, project, atau client tidak ditemukan atau masih dimuat.<br/>Silakan cek koneksi atau API.</div>
        )}
        {!isError && invoiceDetail && invoiceDetail.data && projectList && clientList && (
          <>
            <InvoiceForm
              isEdit={true}
              mutateFn={updateInvoiceMutation.mutate}
              defaultInputData={defaultInputData}
              projectOptions={projectList.data}
              clientOptions={clientList.data}
              showDeleteButton={true}
              onDelete={handleDelete}
            />
            {updateInvoiceMutation.isError && (
              <div className="text-red-500 mt-4">
                Error Saving: {updateInvoiceMutation.error?.message || "Unknown error"}
              </div>
            )}
            {deleteInvoiceMutation.isError && (
              <div className="text-red-500 mt-4">
                Error Deleting: {deleteInvoiceMutation.error?.message || "Unknown error"}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default InvoiceDetail;
