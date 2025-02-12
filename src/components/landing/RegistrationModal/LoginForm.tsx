import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";

interface LoginFormProps {
  onSubmit: (data: { email: string; password: string }) => void;
  error?: string | null;
}

export const LoginForm = ({ onSubmit, error }: LoginFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-white">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="name@example.com"
          className="bg-gray-800/50 border-purple-300/20 text-white placeholder:text-purple-300/40"
          {...register("email", { required: true })}
        />
        {errors.email && (
          <p className="text-red-400 text-sm">Email is required</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-white">
          Password
        </Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          className="bg-gray-800/50 border-purple-300/20 text-white placeholder:text-purple-300/40"
          {...register("password", { required: true })}
        />
        {errors.password && (
          <p className="text-red-400 text-sm">Password is required</p>
        )}
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <Button
        type="submit"
        className="w-full bg-purple-600 hover:bg-purple-700 text-white"
      >
        Sign In
      </Button>
    </form>
  );
};
