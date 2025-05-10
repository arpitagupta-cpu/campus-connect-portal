import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import StudentLayout from "@/components/layout/StudentLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { MessageSquareText, Bug, Lightbulb, Check, AlertTriangle } from "lucide-react";

// Create a schema for the feedback form
const feedbackSchema = z.object({
  type: z.enum(["bug", "feature", "feedback"], {
    required_error: "Please select a feedback type",
  }),
  title: z.string().min(5, {
    message: "Title must be at least 5 characters long",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters long",
  }),
});

type FeedbackForm = z.infer<typeof feedbackSchema>;

export default function StudentFeedback() {
  const { currentUser } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();
  
  // Initialize form with react-hook-form
  const form = useForm<FeedbackForm>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      type: "feedback",
      title: "",
      description: "",
    },
  });
  
  // Submit feedback mutation
  const submitFeedbackMutation = useMutation({
    mutationFn: async (data: FeedbackForm) => {
      if (!currentUser) {
        throw new Error("You must be logged in to submit feedback");
      }
      
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          userId: (currentUser as any).id || 0,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to submit feedback");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback!",
      });
      setSubmitted(true);
      
      // Reset form after successful submission
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit feedback",
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (data: FeedbackForm) => {
    submitFeedbackMutation.mutate(data);
  };
  
  // Get icon for feedback type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "bug":
        return <Bug className="h-5 w-5" />;
      case "feature":
        return <Lightbulb className="h-5 w-5" />;
      case "feedback":
      default:
        return <MessageSquareText className="h-5 w-5" />;
    }
  };
  
  return (
    <StudentLayout title="Feedback">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Submit Feedback</CardTitle>
            <CardDescription>
              Help us improve by sharing your thoughts, reporting bugs, or suggesting new features
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="text-center py-8">
                <div className="mx-auto h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">Thank You!</h3>
                <p className="text-gray-500 mb-4">
                  Your feedback has been submitted successfully.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setSubmitted(false)}
                >
                  Submit Another Feedback
                </Button>
              </div>
            ) : (
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label>Feedback Type</Label>
                    <RadioGroup
                      value={form.watch("type")}
                      onValueChange={(value) => form.setValue("type", value as "bug" | "feature" | "feedback")}
                      className="flex flex-col space-y-1 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="bug" id="bug" />
                        <Label htmlFor="bug" className="flex items-center gap-2 cursor-pointer">
                          <Bug className="h-4 w-4 text-red-500" />
                          Report a Bug
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="feature" id="feature" />
                        <Label htmlFor="feature" className="flex items-center gap-2 cursor-pointer">
                          <Lightbulb className="h-4 w-4 text-yellow-500" />
                          Suggest a Feature
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="feedback" id="feedback" />
                        <Label htmlFor="feedback" className="flex items-center gap-2 cursor-pointer">
                          <MessageSquareText className="h-4 w-4 text-blue-500" />
                          General Feedback
                        </Label>
                      </div>
                    </RadioGroup>
                    {form.formState.errors.type && (
                      <p className="text-sm text-red-500 mt-1">
                        {form.formState.errors.type.message}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Brief summary of your feedback"
                      {...form.register("title")}
                      className="mt-1"
                    />
                    {form.formState.errors.title && (
                      <p className="text-sm text-red-500 mt-1">
                        {form.formState.errors.title.message}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Please provide details about your feedback..."
                      rows={5}
                      {...form.register("description")}
                      className="mt-1"
                    />
                    {form.formState.errors.description && (
                      <p className="text-sm text-red-500 mt-1">
                        {form.formState.errors.description.message}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center text-amber-600">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    <span className="text-xs">Your feedback helps us improve</span>
                  </div>
                  <Button
                    type="submit"
                    disabled={submitFeedbackMutation.isPending}
                  >
                    {submitFeedbackMutation.isPending ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Submitting...
                      </>
                    ) : (
                      <>Submit Feedback</>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </StudentLayout>
  );
}