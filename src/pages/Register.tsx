import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import axios from "../utils/AxiosInstance";

export type RegisterInput = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export const Register = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<RegisterInput>();

  const password = watch("password");

  const handleRegister = async (data: RegisterInput) => {
    try {
      const res = await axios.post("/api/auth/register", {
        username: data.username,
        email: data.email,
        password: data.password
      });

      if (res.data) {
        alert("Registration successful! Please login.");
        navigate("/login");
      }
    } catch (err) {
      alert("Registration failed. Please try again.");
    }
  };

  const { mutate, isPending } = useMutation({
    mutationFn: handleRegister
  });

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row">
      {/* Left Side - Brand Section */}
      <div className="lg:w-1/2 flex flex-col justify-center p-8 lg:p-16 text-center lg:text-left">
        <div className="max-w-xl mx-auto lg:mx-0">
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-4 lg:mb-6">
            Join FreeLink
          </h1>
          <p className="text-slate-700 mb-6 lg:mb-8 text-base lg:text-lg">
            Start managing your freelance career more efficiently. Create an account
            to access all features and join our community of successful freelancers.
          </p>
          <div className="flex justify-center lg:justify-start">
            <button 
              onClick={() => navigate("/login")}
              className="inline-flex items-center border border-slate-300 rounded-full 
                       py-2 px-4 lg:py-3 lg:px-6 hover:bg-slate-200 transition-colors
                       text-sm lg:text-base"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" 
                   fill="none" stroke="currentColor" strokeWidth="2" 
                   strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              <span>Back to Login</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="lg:w-1/2 bg-[#1f3354] flex items-center justify-center p-6 lg:p-12">
        <div className="bg-white w-full max-w-md p-6 lg:p-8 rounded-lg shadow-md">
          <h2 className="text-xl lg:text-2xl font-bold text-center mb-6">
            Create your account
          </h2>
          
          <form onSubmit={handleSubmit((data) => mutate(data))} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <input 
                type="text"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 
                         focus:ring-[#1f3354] focus:border-transparent transition-all"
                {...register("username", { 
                  required: "Username is required",
                  minLength: {
                    value: 3,
                    message: "Username must be at least 3 characters"
                  }
                })}
              />
              {errors.username && (
                <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input 
                type="email"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 
                         focus:ring-[#1f3354] focus:border-transparent transition-all"
                {...register("email", { 
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address"
                  }
                })}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input 
                type="password"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 
                         focus:ring-[#1f3354] focus:border-transparent transition-all"
                {...register("password", { 
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters"
                  }
                })}
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Confirm Password</label>
              <input 
                type="password"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 
                         focus:ring-[#1f3354] focus:border-transparent transition-all"
                {...register("confirmPassword", { 
                  required: "Please confirm your password",
                  validate: value => value === password || "Passwords do not match"
                })}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-[#1f3354] text-white py-2 rounded hover:bg-[#2a3f6a] 
                       transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-[#1f3354]
                       disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              disabled={isPending}
            >
              {isPending ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Creating account...
                </div>
              ) : (
                "Create Account"
              )}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>
          </form>
          
          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <button
              className="text-[#1f3354] font-semibold hover:underline focus:outline-none
                       focus:ring-2 focus:ring-[#1f3354] focus:ring-offset-2 rounded"
              onClick={() => navigate("/login")}
            >
              Log in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
