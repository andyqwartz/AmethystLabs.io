import { toast as sonnerToast, Toast } from "sonner";

type ToastType = "success" | "error" | "loading" | "info";

interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastType;
  duration?: number;
}

export function toast({
  title,
  description,
  variant = "success",
  duration = 4000,
}: ToastOptions) {
  sonnerToast.custom(
    ({ id }) => (
      <div className="w-full max-w-md bg-[#1A1625]/95 backdrop-blur-lg border border-purple-300/20 rounded-xl p-4 shadow-lg pointer-events-auto">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-white">{title}</h3>
            {description && (
              <p className="mt-1 text-sm text-purple-200/80">{description}</p>
            )}
          </div>
        </div>
      </div>
    ),
    {
      duration,
      position: "top-center",
      className: "!bg-transparent !border-0 !p-0 !rounded-none !shadow-none",
    },
  );
}
