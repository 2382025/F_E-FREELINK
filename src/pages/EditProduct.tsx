import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ProductForm, { ProductFormInput } from "../components/ProductForm";
import axios from "../utils/AxiosInstance";
import { fetchProductDetail } from "./ProductDetail";

const editProduct = async (data: ProductFormInput, id: string | undefined) => {
  return await axios.put(`/products/${id}`, data);
};

const EditProduct = () => {
  const { id } = useParams();
  const editProductMutation = useMutation({
    mutationFn: (data: ProductFormInput) => editProduct(data, id)
  });
  const getProductDetail = useQuery({
    queryKey: ["productDetail", id],
    queryFn: () => fetchProductDetail(id)
  });
  const navigate = useNavigate();
  useEffect(() => {
    if (editProductMutation.isSuccess) {
      navigate("/product", { replace: true });
    }
  }, [editProductMutation.isSuccess]);
  return (
    <div className="relative">
      {(editProductMutation.isPending || getProductDetail.isFetching) && (
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
      <h2 className="text-2xl font-bold mb-6 mt-10">Edit Product</h2>
      <ProductForm
        isEdit={true}
        mutateFn={editProductMutation.mutate}
        defaultInputData={getProductDetail.data?.data}
      />
    </div>
  );
};

export default EditProduct;
