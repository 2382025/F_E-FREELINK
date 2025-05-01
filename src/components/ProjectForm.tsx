import { useState, useEffect } from "react";
import { useAuth } from "../utils/AuthProvider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../utils/AxiosInstance";
import { useNavigate } from "react-router-dom";

type ClientType = {
  id: number;
  client_name: string;
};

const fetchClientList = async (token: string | null) => {
  return await axios.get<ClientType[]>("/api/client", {
    headers: { Authorization: `Bearer ${token}` }
  });
};

type NewProjectType = {
  project_name: string;
  client_id: number;
  due_date: string;
  project_status: string;
};

const addProject = async (token: string | null, project: NewProjectType) => {
  return await axios.post("/api/project", project, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

interface ProjectFormProps {
  isEdit?: boolean;
  mutateFn?: (data: NewProjectType) => void;
  defaultInputData?: NewProjectType;
  showDeleteButton?: boolean;
  onDelete?: () => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ 
  isEdit = false, 
  mutateFn, 
  defaultInputData,
  showDeleteButton,
  onDelete 
}) => {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const [projectName, setProjectName] = useState("");
  const [clientId, setClientId] = useState<number | null>(null);
  const [dueDate, setDueDate] = useState("");
  const [projectStatus, setProjectStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: clientData } = useQuery({
    queryKey: ["clientList"],
    queryFn: () => fetchClientList(getToken()),
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  const addProjectMutation = useMutation({
    mutationFn: (newProject: NewProjectType) => addProject(getToken(), newProject),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projectList"] });
      navigate("/projects");
    },
    onError: (error) => {
      console.error("Error adding project:", error);
      setFormError("Failed to add project. Please try again.");
      setIsSubmitting(false);
    }
  });

  const projectStatusOptions = [
    "Pending",
    "In Progress",
    "Done"
  ];

  useEffect(() => {
    console.log('State updated:', {
      projectName,
      clientId,
      dueDate,
      projectStatus
    });
  }, [projectName, clientId, dueDate, projectStatus]);

  useEffect(() => {
    if (isEdit && defaultInputData) {
      console.log('Setting default data:', {
        defaultInputData,
        client_id: defaultInputData.client_id,
        due_date: defaultInputData.due_date
      });
      
      setProjectName(defaultInputData.project_name || "");
      setClientId(defaultInputData.client_id ? Number(defaultInputData.client_id) : null);
      
      // Format tanggal ke format yang benar
      if (defaultInputData.due_date) {
        const date = new Date(defaultInputData.due_date);
        const formattedDueDate = date.toISOString().split('T')[0];
        console.log('Due date conversion:', {
          original: defaultInputData.due_date,
          formatted: formattedDueDate
        });
        setDueDate(formattedDueDate);
      } else {
        setDueDate("");
      }
      
      setProjectStatus(defaultInputData.project_status || "");
    }
  }, [isEdit, defaultInputData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validasi form
    if (!projectName.trim()) {
      setFormError("Project name is required");
      return;
    }
    if (clientId === null) {
      setFormError("Client is required");
      return;
    }
    if (!dueDate) {
      setFormError("Due date is required");
      return;
    }
    if (!projectStatus) {
      setFormError("Project status is required");
      return;
    }

    const projectData: NewProjectType = {
      project_name: projectName,
      client_id: Number(clientId),
      due_date: dueDate,
      project_status: projectStatus
    };

    console.log('Submitting form data:', {
      projectData,
      clientId,
      dueDate,
      isEdit,
      hasMutateFn: !!mutateFn
    });

    if (isEdit && mutateFn) {
      mutateFn(projectData);
    } else {
      setIsSubmitting(true);
      addProjectMutation.mutate(projectData);
    }
  };

  const clients = clientData?.data || [];

  return (
    <div className="flex items-center justify-center p-6">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-center mb-6">{isEdit ? "Edit Project" : "Add Project"}</h1>

        {formError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Project Name */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Project Name
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter project name"
            />
          </div>

          {/* Client */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Client
            </label>
            <select
              value={clientId || ""}
              onChange={(e) => {
                const newClientId = e.target.value ? parseInt(e.target.value) : null;
                console.log('Client changed:', {
                  oldValue: clientId,
                  newValue: e.target.value,
                  parsedValue: newClientId
                });
                setClientId(newClientId);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.client_name}
                </option>
              ))}
            </select>
          </div>

          {/* Due Date */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => {
                const newDueDate = e.target.value;
                console.log('Due date changed:', {
                  oldValue: dueDate,
                  newValue: newDueDate
                });
                setDueDate(newDueDate);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Status
            </label>
            <select
              value={projectStatus}
              onChange={(e) => setProjectStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value="">Select Status</option>
              {projectStatusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-800 hover:bg-blue-900 text-white font-medium py-2 px-8 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {isSubmitting ? "Saving..." : (isEdit ? "Save" : "Add Project")}
            </button>
            {showDeleteButton && onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-8 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex items-center"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 mr-1" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Delete
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;
