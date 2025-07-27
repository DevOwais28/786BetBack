import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/Header";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({
      email: formData.email,
      password: formData.password,
    });
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header />
      <div className="flex items-center justify-center p-4 flex-grow">
        <div className="w-full max-w-md bg-gray-800/50 backdrop-blur-sm rounded-3xl p-8 border border-gray-700 shadow-2xl">
          <div className="text-center mb-8">
            <Link href="/">
              <div className="flex items-center justify-center space-x-2 mb-6 cursor-pointer">
                <span className="text-3xl font-bold text-yellow-500">786Bet</span>
                <span className="text-white text-xl">.casino</span>
              </div>
            </Link>
            <h2 className="text-3xl font-bold mb-2 tracking-wide">Welcome Back</h2>
            <p className="text-gray-400">Sign in to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </Label>
              <Input
                type="email"
                id="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <Label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </Label>
              <Input
                type="password"
                id="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300"
                placeholder="Enter password"
              />
            </div>

            <Button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full rounded-2xl bg-yellow-500 hover:bg-emerald-500 text-black font-bold px-6 py-3 shadow-md transition-all duration-300"
            >
              {loginMutation.isPending ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="text-center mt-6">
            <span className="text-gray-400">Don't have an account? </span>
            <Link href="/register" className="text-yellow-500 hover:text-emerald-500 transition-colors duration-300 font-medium">
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}