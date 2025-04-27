import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import InvoiceForm, { InvoiceFormInput } from "../components/InvoiceForm";
import axios from "../utils/AxiosInstance";
import { fetchInvoiceDetail } from "./InvoiceDetail";
import { useAuth } from "../utils/AuthProvider";

// Update invoice on the backend
const editInvoice = async (data: InvoiceFormInput, id: string | undefined, token: string | null) => {
  const payload = {
    project_id: Number(data.projectId),
    client_id: Number(data.clientId),
    amount: Number(data.amount),
    payment_method: data.paymentMethod,
    payment_status: data.status,
    issue_date: data.issueDate
  };

  console.log("Payload to update invoice:", payload); // Debugging log

  return await axios.put(`/api/invoice/${id}`, payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

const fetchProjectList = async (token: string | null) => {
  return await axios.get(`/api/project`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

const fetchClientList = async (token: string | null) => {
  return await axios.get(`/api/client`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

const EditInvoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();

  // Mutation hook for editing invoice
  const editInvoiceMutation = useMutation({
    mutationFn: (data: InvoiceFormInput) => editInvoice(data, id, getToken()),
    onSuccess: () => {
      console.log("Invoice updated successfully");
      navigate("/invoices", { replace: true });
    },
    onError: (error) => {
      console.error("Error updating invoice:", error);
    }
  });

  // Query hook for fetching invoice details
  const getInvoiceDetail = useQuery({
    queryKey: ["invoiceDetail", id],
    queryFn: () => fetchInvoiceDetail(id, getToken()),
    enabled: !!id // Ensure query is enabled only if id exists
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

  // Mapping data invoice dari API ke struktur InvoiceFormInput
  let defaultInputData: InvoiceFormInput | undefined = undefined;
  if (getInvoiceDetail.data && getInvoiceDetail.data.data) {
    const inv = getInvoiceDetail.data.data;
    defaultInputData = {
      projectId: inv.project?.id || "",
      clientId: inv.client?.id || "",
      amount: inv.amount || 0,
      paymentMethod: inv.payment_method || "",
      status: inv.payment_status || "",
      issueDate: inv.issue_date ? inv.issue_date.slice(0, 10) : ""
    };
  }

  return (
    <div className="relative">
      {/* Show loading state while fetching data or submitting mutation */}
      {(editInvoiceMutation.isPending || getInvoiceDetail.isFetching) && (
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

      <h2 className="text-2xl font-bold mb-6 mt-10">Edit Invoice</h2>

      {/* Render InvoiceForm */}
      {projectList && clientList && (
        <InvoiceForm
          isEdit={true}
          mutateFn={editInvoiceMutation.mutate}
          defaultInputData={defaultInputData}
          projectOptions={projectList.data}
          clientOptions={clientList.data}
          showDeleteButton={true}
          onDelete={() => {
            if (window.confirm('Are you sure you want to delete this invoice?')) {
              // Implement delete functionality here
            }
          }}
        />
      )}
    </div>
  );
};

export default EditInvoice;
