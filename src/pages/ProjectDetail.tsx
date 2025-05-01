import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import {useState } from "react";
import ProjectForm from "../components/ProjectForm";
import axios from "../utils/AxiosInstance";
import { useAuth } from "../utils/AuthProvider";

type ProjectType = {
  project_name: string;
  client_id: number;
  due_date: string;
  project_status: string;
};

export const fetchProjectDetail = async (id: string | undefined, token: string | null) => {
  console.log('Fetching project detail for id:', id); // Debug log
  const response = await axios.get(`/api/project/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log('Project detail response:', response.data); // Debug log
  return response;
};

const updateProject = async (id: string | undefined, data: ProjectType, token: string | null) => {
  // Ensure data has the correct format
  const formattedData = {
    ...data,
    client_id: Number(data.client_id), // Ensure client_id is a number
    due_date: data.due_date // Keep original date format
  };

  console.log('Updating project with data:', {
    originalData: data,
    formattedData,
    client_id: formattedData.client_id,
    client_id_type: typeof formattedData.client_id,
    due_date: formattedData.due_date,
    due_date_type: typeof formattedData.due_date
  });

  try {
    const response = await axios.put(`/api/project/${id}`, formattedData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Update project response:', response.data);
    return response;
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
};

const deleteProject = async (id: string | undefined, token: string | null) => {
  return await axios.delete(`/api/project/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};


const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { data: projectDetail, isLoading, isError } = useQuery({
    queryKey: ["projectDetail", id],
    queryFn: () => fetchProjectDetail(id, getToken()),
    refetchOnWindowFocus: true, // Enable refetch on window focus
    refetchInterval: false,
    staleTime: 0 // Always consider data stale
  });

  const updateProjectMutation = useMutation({
    mutationFn: (data: ProjectType) => updateProject(id, data, getToken()),
    onSuccess: () => {
      console.log('Project updated successfully'); // Debug log
      queryClient.invalidateQueries({ queryKey: ["projectList"] });
      queryClient.invalidateQueries({ queryKey: ["projectDetail", id] });
      queryClient.invalidateQueries({ queryKey: ["clientList"] });
      navigate("/projects", { replace: true });
    },
    onError: (error) => {
      console.error('Error updating project:', error); // Debug log
    }
  });

  const deleteProjectMutation = useMutation({
    mutationFn: () => deleteProject(id, getToken()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projectList"] });
      navigate("/projects", { replace: true });
    }
  });

  const DeleteConfirmationModal = () => {
    if (!isDeleteModalOpen) return null;
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
          <h3 className="text-lg font-medium mb-3">Delete Confirmation</h3>
          <p className="text-gray-600 mb-4">
            Are you sure you want to delete this project? This action cannot be undone.
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
                deleteProjectMutation.mutate();
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

  const isAnyLoading = isLoading || updateProjectMutation.isPending || deleteProjectMutation.isPending;

  return (
    <div className="flex justify-center items-center min-h-[80vh] bg-[#f7fafd]">
      <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-lg p-8 border-2 border-purple-300">
        <h2 className="text-2xl font-bold text-center mb-6">Edit Project</h2>
        {isAnyLoading && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10 rounded-lg">
            <span className="text-lg text-gray-700">Loading...</span>
          </div>
        )}
        <DeleteConfirmationModal />
        {isError && (
          <div className="text-red-500 mb-4">Failed to load project. Please try again.</div>
        )}
        {!isError && (!projectDetail || !projectDetail.data) && (
          <div className="text-gray-500 text-center py-8">Project data not found or still loading.<br/>Please check your connection or API.</div>
        )}
        {!isError && projectDetail && projectDetail.data && (
          <>
            <ProjectForm
              isEdit={true}
              mutateFn={updateProjectMutation.mutate}
              defaultInputData={projectDetail.data}
            />
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded"
                disabled={deleteProjectMutation.isPending}
              >
                Delete
              </button>
            </div>
            {updateProjectMutation.isError && (
              <div className="text-red-500 mt-4">
                Error while saving: {updateProjectMutation.error?.message || "Unknown error"}
              </div>
            )}
            {deleteProjectMutation.isError && (
              <div className="text-red-500 mt-4">
                Error while deleting: {deleteProjectMutation.error?.message || "Unknown error"}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;
