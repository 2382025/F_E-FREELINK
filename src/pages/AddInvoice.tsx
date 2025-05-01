import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import axios from "../utils/AxiosInstance";
import { useEffect } from "react";
import { useAuth } from "../utils/AuthProvider";
import InvoiceForm from "../components/InvoiceForm";

type ClientType = {
  id: number;
  client_name: string;
};

type ProjectType = {
  id: number;
  project_name: string;
  client_id: number;
};

// Fetch client list
const fetchClientList = async (token: string | null) => {
  if (!token) {
    throw new Error("No authentication token found");
  }
  return await axios.get<ClientType[]>("/api/client", {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Fetch project list
const fetchProjectList = async (token: string | null) => {
  if (!token) {
    throw new Error("No authentication token found");
  }
  const response = await axios.get<ProjectType[]>("/api/project", {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('Projects fetched:', response.data);
  return response;
};

// API untuk tambah invoice
const addInvoice = async (data: { 
  projectId: number;
  clientId: number;
  amount: number;
  status: string;
  paymentMethod: string;
  issueDate: string;
}, token: string | null) => {
  if (!token) {
    throw new Error("No authentication token found");
  }
  try {
    const payload = {
      project_id: Number(data.projectId),
      client_id: Number(data.clientId),
      amount: Number(data.amount),
      payment_status: data.status,
      payment_method: data.paymentMethod,
      issue_date: data.issueDate
    };
    console.log('Sending invoice data:', payload);
    const response = await axios.post("/api/invoice", payload, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Invoice created successfully:', response.data);
    return response;
  } catch (error: any) {
    console.error('Error creating invoice:', error.response?.data || error.message);
    throw error;
  }
};

const AddInvoice = () => {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const { mutate, isSuccess, isPending } = useMutation({
    mutationFn: (data: { 
      projectId: number;
      clientId: number;
      amount: number;
      status: string;
      paymentMethod: string;
      issueDate: string;
    }) => addInvoice(data, getToken()),
    onError: (error: Error) => {
      console.error('Mutation error:', error.message);
    }
  });

  // Fetch client and project data
  const { data: clientData } = useQuery({
    queryKey: ["clientList"],
    queryFn: () => fetchClientList(getToken()),
  });

  const { data: projectData } = useQuery({
    queryKey: ["projectList"],
    queryFn: () => fetchProjectList(getToken()),
  });

  useEffect(() => {
    if (isSuccess) {
      navigate("/invoices", { replace: true });
    }
  }, [isSuccess, navigate]);

  if (!clientData?.data || !projectData?.data) {
    return <div>Loading...</div>;
  }

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

      <h2 className="text-2xl font-bold mb-6 mt-10">Add Invoice</h2>
      <InvoiceForm
        isEdit={false}
        mutateFn={mutate}
        projectOptions={projectData.data}
        clientOptions={clientData.data}
      />
    </div>
  );
};

export default AddInvoice;
