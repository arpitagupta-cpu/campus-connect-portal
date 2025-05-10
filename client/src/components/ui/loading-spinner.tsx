import React from "react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
}

export function LoadingSpinner({ 
  size = "md", 
  className, 
  ...props 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
  };
  
  return (
    <div 
      className={cn(
        "animate-spin rounded-full border-solid border-primary border-t-transparent",
        sizeClasses[size],
        className
      )} 
      {...props}
    />
  );
}

export function LoadingOverlay({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
      <LoadingSpinner size="lg" className="mb-4" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}

export function SkeletonLoader() {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[200px]">
      <LoadingSpinner />
    </div>
  );
}