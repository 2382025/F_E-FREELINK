import { UseMutateFunction } from "@tanstack/react-query";
import React, { useEffect } from "react";
import { SubmitHandler, useForm, useWatch } from "react-hook-form";

interface InvoiceFormProps {
  isEdit: boolean;
  mutateFn: UseMutateFunction<any, Error, InvoiceFormInput, unknown>;
  defaultInputData?: InvoiceFormInput;
  projectOptions: { id: number; project_name: string; client_id: number }[];
  clientOptions: { id: number; client_name: string }[];
  showDeleteButton?: boolean;
  onDelete?: () => void;
}

export type InvoiceFormInput = {
  projectId: number;
  clientId: number;
  amount: number;
  paymentMethod: string;
  status: string;
  issueDate: string;
};

const InvoiceForm: React.FC<InvoiceFormProps> = ({
  projectOptions,
  clientOptions,
  isEdit,
  showDeleteButton,
  onDelete,
  mutateFn,
  defaultInputData
}) => {
  console.log('Project Options:', projectOptions);
  console.log('Client Options:', clientOptions);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors }
  } = useForm<InvoiceFormInput>();

  // Watch projectId changes
  const selectedProjectId = useWatch({
    control,
    name: "projectId"
  });

  console.log('Selected Project ID:', selectedProjectId);

  // Get selected project's client_id
  const selectedProject = projectOptions.find(p => p.id === Number(selectedProjectId));
  console.log('Selected Project:', selectedProject);

  const selectedClientId = selectedProject?.client_id;
  console.log('Selected Client ID:', selectedClientId);

  // Set clientId automatically when project changes
  useEffect(() => {
    console.log('useEffect triggered with selectedClientId:', selectedClientId);
    if (selectedClientId) {
      console.log('Mengatur client_id otomatis:', selectedClientId);
      setValue("clientId", selectedClientId);
    }
  }, [selectedClientId, setValue]);

  useEffect(() => {
    if (defaultInputData) {
      console.log('Setting default data:', defaultInputData);
      setValue("projectId", defaultInputData.projectId);
      setValue("clientId", defaultInputData.clientId);
      setValue("amount", defaultInputData.amount);
      setValue("paymentMethod", defaultInputData.paymentMethod);
      setValue("status", defaultInputData.status);
      
      // Format tanggal ke format yang benar
      if (defaultInputData.issueDate) {
        const date = new Date(defaultInputData.issueDate);
        const formattedIssueDate = date.toISOString().split('T')[0];
        console.log('Issue date conversion:', {
          original: defaultInputData.issueDate,
          formatted: formattedIssueDate
        });
        setValue("issueDate", formattedIssueDate);
      } else {
        setValue("issueDate", "");
      }
    }
  }, [defaultInputData, setValue]);

  const onSubmit: SubmitHandler<InvoiceFormInput> = (data) => {
    console.log('Form submitted with data:', data);
    if (isEdit) {
      if (!confirm("Are you sure you want to update the invoice?")) {
        return;
      }
    }
    
    const processedData = {
      ...data,
      amount: Number(data.amount),
      projectId: Number(data.projectId),
      clientId: Number(data.clientId),
      issueDate: data.issueDate
    };
    console.log('Processed data:', processedData);
    mutateFn(processedData);
  };


  const selectedClient = clientOptions.find(c => c.id === selectedClientId);
  console.log('Selected Client:', selectedClient);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Project Dropdown */}
      <div>
        <label className="block text-gray-700 font-bold mb-2">Project</label>
        <select
          {...register("projectId", { 
            required: true, 
            valueAsNumber: true,
            onChange: (e) => {
              console.log('Project dropdown changed:', e.target.value);
            }
          })}
          className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.projectId && "border-red-500"}`}
        >
          <option value="">Select a project</option>
          {projectOptions.map((project) => (
            <option key={project.id} value={project.id}>
              {project.project_name}
            </option>
          ))}
        </select>
        {errors.projectId && (
          <p className="text-red-600 text-xs italic">Project is required.</p>
        )}
      </div>

      {/* Client Display (Read-only) */}
      <div>
        <label className="block text-gray-700 font-bold mb-2">Client</label>
        <input
          type="text"
          readOnly
          value={selectedClient?.client_name || ""}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 bg-gray-100 leading-tight focus:outline-none focus:shadow-outline"
        />
        <input
          type="hidden"
          {...register("clientId", { required: true, valueAsNumber: true })}
        />
      </div>

      {/* Amount */}
      <div>
        <label className="block text-gray-700 font-bold mb-2">Amount</label>
        <input
          type="number"
          step="0.01"
          min="0"
          {...register("amount", { 
            required: true, 
            valueAsNumber: true,
            validate: (value) => value > 0 || "Amount must be greater than 0"
          })}
          className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.amount && "border-red-500"}`}
        />
        {errors.amount && (
          <p className="text-red-600 text-xs italic">
            {errors.amount.type === "validate" 
              ? "Amount must be greater than 0" 
              : "Amount is required"}
          </p>
        )}
      </div>

      {/* Payment Method */}
      <div>
        <label className="block text-gray-700 font-bold mb-2">Payment Method</label>
        <input
          type="text"
          {...register("paymentMethod", { required: true })}
          className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.paymentMethod && "border-red-500"}`}
          placeholder="Enter payment method"
        />
        {errors.paymentMethod && (
          <p className="text-red-600 text-xs italic">Payment method is required.</p>
        )}
      </div>

      {/* Status Dropdown */}
      <div>
        <label className="block text-gray-700 font-bold mb-2">Status</label>
        <select
          {...register("status", { required: true })}
          className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.status && "border-red-500"}`}
        >
          <option value="">Select status</option>
          <option value="Paid">Paid</option>
          <option value="Unpaid">Unpaid</option>
          <option value="Overdue">Overdue</option>
        </select>
        {errors.status && (
          <p className="text-red-600 text-xs italic">Status is required.</p>
        )}
      </div>

      {/* Issue Date */}
      <div>
        <label className="block text-gray-700 font-bold mb-2">Issue Date</label>
        <input
          type="date"
          {...register("issueDate", { required: true })}
          className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.issueDate && "border-red-500"}`}
        />
        {errors.issueDate && (
          <p className="text-red-600 text-xs italic">Issue date is required.</p>
        )}
      </div>

      {/* Submit and Delete Button */}
      <div className="flex items-center justify-between gap-4">
        {isEdit ? (
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Update Invoice
          </button>
        ) : (
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Add Invoice
          </button>
        )}
        {showDeleteButton && onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
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
  );
};

export default InvoiceForm;
