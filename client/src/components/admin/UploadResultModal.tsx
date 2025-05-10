import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { insertResultSchema } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";

interface UploadResultModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const formSchema = insertResultSchema.extend({});

type FormData = z.infer<typeof formSchema>;

interface Student {
  id: number;
  username: string;
  fullName: string;
}

export default function UploadResultModal({ isOpen, onClose }: UploadResultModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Fetch students
  const { data: students } = useQuery<Student[]>({
    queryKey: ['/api/admin/students'],
    enabled: isOpen,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentId: 0,
      title: "",
      description: "",
      score: 0,
      maxScore: 100,
      authorId: 1, // This would typically come from the current user
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      
      await apiRequest("POST", "/api/results", data);
      
      toast({
        title: "Result Uploaded",
        description: "The result has been successfully uploaded.",
      });

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/results'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/activities'] });
      
      form.reset();
      onClose();
    } catch (error) {
      console.error("Error uploading result:", error);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: "There was an error uploading the result.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Student Result</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="studentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(parseInt(value))} 
                    value={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select student" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {students?.map(student => (
                        <SelectItem key={student.id} value={student.id.toString()}>
                          {student.fullName}
                        </SelectItem>
                      )) || (
                        <SelectItem value="1">John Doe</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Result Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Midterm Exam" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Additional details about the result" 
                      rows={2} 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="score"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Score</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={0} 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="maxScore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Score</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={1} 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 100)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Uploading...' : 'Upload Result'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
