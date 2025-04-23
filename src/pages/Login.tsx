import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthProvider";
import axios from "../utils/AxiosInstance";
import { useMutation } from "@tanstack/react-query";

export type LoginInput = {
  email: string;
  password: string;
};

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginInput>();

  const handleLogin = async (data: LoginInput) => {
    try {
      const res = await axios.post<{ access_token: string }>(
        "/api/auth/login",
        {
          email: data.email,
          password: data.password
        }
      );

      if (res.data) {
        login(res.data.access_token);
        navigate("/");
      } else {
        alert("Email or password is wrong");
      }
    } catch (err) {
      alert("Email or password is wrong");
    }
  };

  const { mutate, isPending } = useMutation({
    mutationFn: handleLogin
  });

  const handleGetStarted = () => {
    navigate("/register");
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Left Side */}
      <div className="w-1/2 flex flex-col justify-center p-16">
        <h1 className="text-5xl font-bold text-slate-800 mb-6">FreeLink</h1>
        <p className="text-slate-700 mb-8 text-lg">
          Your all-in-one platform to manage freelance projects, connect with clients, track your invoices, and showcase your best work.
        </p>
        <div>
          <button 
            onClick={handleGetStarted}
            className="flex items-center border border-slate-300 rounded-full py-3 px-6 hover:bg-slate-200 transition-colors"
          >
            <span className="mr-2">Get Started</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Right Side */}
      <div className="w-1/2 bg-[#1f3354] flex items-center justify-center p-12">
        <div className="bg-white w-full max-w-md p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-center mb-6">Log into your account</h2>
          
          <form onSubmit={handleSubmit((data) => mutate(data))}>
          <div className="mb-4">
  <label className="block text-sm font-medium mb-1">Email</label>
  <input 
    type="email" 
    className="w-full p-2 border border-gray-300 rounded"
    {...register("email", { required: true })}
    autoComplete="username"
  />
  {errors.email && (
    <p className="text-red-500 text-xs mt-1">Email is required.</p>
  )}
</div>

            
            <div className="mb-6">
  <label className="block text-sm font-medium mb-1">Password</label>
  <input 
    type="password" 
    className="w-full p-2 border border-gray-300 rounded"
    {...register("password", { required: true })}
    autoComplete="current-password"
  />
  {errors.password && (
    <p className="text-red-500 text-xs mt-1">Password is required.</p>
  )}
</div>

            
            <button 
              type="submit" 
              className="w-full bg-[#1f3354] text-white py-2 rounded-md hover:bg-slate-700 transition-colors"
              disabled={isPending}
            >
              {isPending ? "Signing in..." : "Login"}
            </button>
          </form>
          
          <p className="mt-4 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <span
              className="text-[#1f3354] font-semibold hover:underline cursor-pointer"
              onClick={() => navigate("/register")}
            >
              Sign up
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;