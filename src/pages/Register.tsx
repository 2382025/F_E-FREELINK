import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import axios from "../utils/AxiosInstance";

export type RegisterInput = {
  email: string;
  username: string;
  password: string;
};

export const Register = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterInput>();

  const handleRegister = async (data: RegisterInput) => {
    try {
      await axios.post("/api/auth/register", {
        email: data.email,
        username: data.username,
        password: data.password
      });
      alert("User successfully registered");
      navigate("/login");
    } catch (err) {
      alert("Username or email already registered");
    }
  };

  const { mutate } = useMutation({ mutationFn: handleRegister });

  return (
    <div className="flex min-h-screen bg-slate-100">
    {/* Left Side */}
    <div className="w-1/2 flex flex-col justify-center p-16">
      <h1 className="text-5xl font-bold text-slate-800 mb-6">FreeLink</h1>
      <p className="text-slate-700 mb-8 text-lg">
        Your all-in-one platform to manage freelance projects, connect with clients, track your invoices, and showcase your best work.
      </p>
      </div>

      {/* Right side */}
      <div className="w-1/2 bg-slate-800 flex items-center justify-center p-12">
      <div className="bg-white w-full max-w-md p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-center mb-6 text-black">
            Get Started
          </h2>

          <form
            className="space-y-5"
            onSubmit={handleSubmit((data) => mutate(data))}
          >
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                id="username"
                type="text"
                required
                {...register("username")}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.username && (
                <p className="text-red-600 text-xs italic">
                  Username is required.
                </p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                {...register("email")}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.email && (
                <p className="text-red-600 text-xs italic">
                  Email is required.
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                {...register("password")}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.password && (
                <p className="text-red-600 text-xs italic">
                  Password is required.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-[#1f3354] text-white py-3 rounded-full font-semibold hover:bg-[#16253c] transition"
            >
              Sign up
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <span
              className="text-[#1f3354] font-semibold hover:underline cursor-pointer"
              onClick={() => navigate("/login")}
            >
              Sign in
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;