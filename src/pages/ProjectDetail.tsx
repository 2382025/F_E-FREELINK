import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ProjectForm from "../components/ProjectForm";
import axios from "../utils/AxiosInstance";
import { useAuth } from "../utils/AuthProvider";

interface ProjectDetailType {
  id: number;
  project_name: string;
  due_date: string;
  project_status: string;
  client: {
    client_name: string;
    id: number;
  };
  created_at: string;
  updated_at: string;
}

interface DeletedProject extends ProjectDetailType {
  isDeleted: boolean;
  deletedOn: string;
}

export const fetchProjectDetail = async (id: string | undefined, token: string | null) => {
  return await axios.get(`/api/project/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

const updateProject = async (id: string | undefined, data: any, token: string | null) => {
  return await axios.put(`/api/project/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

const deleteProject = async (id: string | undefined, token: string | null) => {
  return await axios.delete(`/api/project/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

const ProjectDetailSkeleton = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-6 animate-pulse">
      <div className="h-10 bg-gray-300 rounded"></div>
      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
      <div className="h-4 bg-gray-300 rounded w-full"></div>
      <div className="h-4 bg-gray-300 rounded w-5/6"></div>
    </div>
  );
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
    refetchOnWindowFocus: false,
    refetchInterval: false
  });

  const updateProjectMutation = useMutation({
    mutationFn: (data: any) => updateProject(id, data, getToken()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projectList"] });
      navigate("/projects", { replace: true });
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
          <h3 className="text-lg font-medium mb-3">Konfirmasi Hapus</h3>
          <p className="text-gray-600 mb-4">
            Apakah Anda yakin ingin menghapus project ini? Tindakan ini tidak dapat dibatalkan.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-800"
            >
              Batal
            </button>
            <button
              onClick={() => {
                deleteProjectMutation.mutate();
                setIsDeleteModalOpen(false);
              }}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md"
            >
              Hapus
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
          <div className="text-red-500 mb-4">Gagal memuat project. Silakan coba lagi.</div>
        )}
        {!isError && (!projectDetail || !projectDetail.data) && (
          <div className="text-gray-500 text-center py-8">Data project tidak ditemukan atau masih dimuat.<br/>Silakan cek koneksi atau API.</div>
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
                Error saat menyimpan: {updateProjectMutation.error?.message || "Unknown error"}
              </div>
            )}
            {deleteProjectMutation.isError && (
              <div className="text-red-500 mt-4">
                Error saat menghapus: {deleteProjectMutation.error?.message || "Unknown error"}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;
