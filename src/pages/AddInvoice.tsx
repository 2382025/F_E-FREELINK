import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import axios from "../utils/AxiosInstance";
import { useEffect, useState } from "react";
import { useAuth } from "../utils/AuthProvider";

type ClientType = {
  id: number;
  client_name: string;
};

type ProjectType = {
  id: number;
  project_name: string;
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
  return await axios.get<ProjectType[]>("/api/project", {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// API untuk tambah invoice
const addInvoice = async (data: { 
  project_id: number;
  client_id: number;
  amount: number;
  payment_status: string;
  issue_date: string;
}, token: string | null) => {
  if (!token) {
    throw new Error("No authentication token found");
  }
  try {
    console.log('Sending invoice data:', data);
    const response = await axios.post("/api/invoice", data, {
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
      project_id: number;
      client_id: number;
      amount: number;
      payment_status: string;
      issue_date: string;
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

  const [clients, setClients] = useState<ClientType[]>([]);
  const [projects, setProjects] = useState<ProjectType[]>([]);

  useEffect(() => {
    if (clientData?.data) {
      setClients(clientData.data);
    }
    if (projectData?.data) {
      setProjects(projectData.data);
    }
  }, [clientData, projectData]);

  useEffect(() => {
    if (isSuccess) {
      navigate("/invoices", { replace: true });
    }
  }, [isSuccess, navigate]);

  const invoiceStatusOptions = ["Pending", "Paid", "Overdue"];

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
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);
          const data = {
            project_id: parseInt(formData.get("project_id") as string, 10),
            client_id: parseInt(formData.get("client_id") as string, 10),
            amount: parseFloat(formData.get("amount") as string),
            payment_status: formData.get("payment_status") as string,
            issue_date: formData.get("issue_date") as string,
          };
          console.log('Form data before mutation:', data);
          mutate(data);
        }}
        className="space-y-6"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700">Project</label>
          <select
            name="project_id"
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.project_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Client</label>
          <select
            name="client_id"
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Client</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.client_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Amount</label>
          <input
            type="number"
            name="amount"
            required
            min="0"
            step="0.01"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Payment Status</label>
          <select
            name="payment_status"
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Status</option>
            {invoiceStatusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Issue Date</label>
          <input
            type="date"
            name="issue_date"
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add Invoice
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddInvoice;
