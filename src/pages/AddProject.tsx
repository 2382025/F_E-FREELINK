import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import axios from "../utils/AxiosInstance";
import { useEffect, useState } from "react";
import { useAuth } from "../utils/AuthProvider";

type ClientType = {
  id: number;
  client_name: string;
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

// API untuk tambah project
const addProject = async (data: { 
  project_name: string;
  client_id: number;
  due_date: string;
  project_status: string;
}, token: string | null) => {
  if (!token) {
    throw new Error("No authentication token found");
  }
  return await axios.post("/api/project", data, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

const AddProject = () => {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const { mutate, isSuccess, isPending } = useMutation({
    mutationFn: (data: { 
      project_name: string;
      client_id: number;
      due_date: string;
      project_status: string;
    }) => addProject(data, getToken()),
  });

  const { data: clientData } = useQuery({
    queryKey: ["clientList"],
    queryFn: () => fetchClientList(getToken()),
  });

  const [clients, setClients] = useState<ClientType[]>([]);

  useEffect(() => {
    if (clientData?.data) {
      setClients(clientData.data);
    }
  }, [clientData]);

  useEffect(() => {
    if (isSuccess) {
      navigate("/projects", { replace: true });
    }
  }, [isSuccess, navigate]);

  const projectStatusOptions = ["Pending", "In Progress", "Done"];

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
      <h2 className="text-2xl font-bold mb-6 mt-10">Add Project</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);
          const data = {
            project_name: formData.get("project_name") as string,
            client_id: parseInt(formData.get("client_id") as string, 10),
            due_date: formData.get("due_date") as string,
            project_status: formData.get("project_status") as string,
          };
          mutate(data);
        }}
        className="space-y-6"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700">Project Name</label>
          <input
            type="text"
            name="project_name"
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
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
          <label className="block text-sm font-medium text-gray-700">Due Date</label>
          <input
            type="date"
            name="due_date"
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            name="project_status"
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Status</option>
            {projectStatusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add Project
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProject;
