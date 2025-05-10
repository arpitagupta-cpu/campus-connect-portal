import React from "react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProgressTrackerProps {
  title: string;
  value: number;
  color?: "default" | "success" | "warning" | "danger";
  className?: string;
  size?: "sm" | "md" | "lg";
  showPercentage?: boolean;
  description?: string;
  showIcon?: boolean;
  icon?: React.ReactNode;
}

/**
 * A progress tracker component that displays progress in a circular or horizontal bar.
 */
export default function ProgressTracker({
  title,
  value,
  color = "default",
  className,
  size = "md",
  showPercentage = true,
  description,
  showIcon = false,
  icon
}: ProgressTrackerProps) {
  // Ensure value is between 0 and 100
  const normalizedValue = Math.min(Math.max(value, 0), 100);
  
  // Get color based on value and specified color
  const getProgressColor = () => {
    if (color !== "default") {
      return {
        success: "bg-green-500",
        warning: "bg-yellow-500",
        danger: "bg-red-500",
      }[color];
    }
    
    // Default color scheme based on value
    if (normalizedValue < 30) return "bg-red-500";
    if (normalizedValue < 70) return "bg-yellow-500";
    return "bg-green-500";
  };
  
  // Generate size classes
  const getSizeClasses = () => {
    return {
      sm: "text-sm p-3",
      md: "text-base p-4",
      lg: "text-lg p-5",
    }[size];
  };
  
  // Value color classes
  const getValueColor = () => {
    if (color !== "default") {
      return {
        success: "text-green-700",
        warning: "text-yellow-700",
        danger: "text-red-700",
      }[color];
    }
    
    // Default color scheme based on value
    if (normalizedValue < 30) return "text-red-700";
    if (normalizedValue < 70) return "text-yellow-700";
    return "text-green-700";
  };
  
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">{title}</CardTitle>
          {showIcon && icon && (
            <div className="h-8 w-8 flex items-center justify-center rounded-full bg-primary/10">
              {icon}
            </div>
          )}
        </div>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Progress 
            value={normalizedValue} 
            className={cn("h-2", getProgressColor())}
          />
          {showPercentage && (
            <div className="flex justify-end">
              <span className={cn("font-medium text-sm", getValueColor())}>
                {normalizedValue.toFixed(0)}%
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}