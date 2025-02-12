import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";

interface RegistrationFormProps {
  onSubmit: (data: {
    email: string;
    password: string;
    confirmPassword: string;
  }) => void;
  error?: string | null;
}

export const RegistrationForm = ({
  onSubmit,
  error,
}: RegistrationFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();
  const password = watch("password");

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
          {...register("email", {
            required: true,
            pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
          })}
        />
        {errors.email && (
          <p className="text-red-400 text-sm">
            Please enter a valid email address
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-white">
          Password
        </Label>
        <Input
          id="password"
          type="password"
          placeholder="Create a strong password"
          className="bg-gray-800/50 border-purple-300/20 text-white placeholder:text-purple-300/40"
          {...register("password", { required: true, minLength: 8 })}
        />
        {errors.password && (
          <p className="text-red-400 text-sm">
            Password must be at least 8 characters
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-white">
          Confirm Password
        </Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Confirm your password"
          className="bg-gray-800/50 border-purple-300/20 text-white placeholder:text-purple-300/40"
          {...register("confirmPassword", {
            required: true,
            validate: (value) => value === password || "Passwords do not match",
          })}
        />
        {errors.confirmPassword && (
          <p className="text-red-400 text-sm">
            {errors.confirmPassword.message as string}
          </p>
        )}
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <Button
        type="submit"
        className="w-full bg-purple-600 hover:bg-purple-700 text-white"
      >
        Create Account
      </Button>
    </form>
  );
};
