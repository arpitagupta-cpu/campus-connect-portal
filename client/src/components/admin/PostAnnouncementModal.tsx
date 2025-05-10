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
import { insertAnnouncementSchema } from "@shared/schema";

interface PostAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const formSchema = insertAnnouncementSchema.extend({});

type FormData = z.infer<typeof formSchema>;

export default function PostAnnouncementModal({ isOpen, onClose }: PostAnnouncementModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      targetGroup: "all",
      authorId: 1, // This would typically come from the current user
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      
      await apiRequest("POST", "/api/announcements", data);
      
      toast({
        title: "Announcement Posted",
        description: "Your announcement has been successfully posted.",
      });

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/announcements'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/activities'] });
      
      form.reset();
      onClose();
    } catch (error) {
      console.error("Error posting announcement:", error);
      toast({
        variant: "destructive",
        title: "Post Failed",
        description: "There was an error posting the announcement.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Post New Announcement</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Announcement Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Announcement Content</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter announcement content" 
                      rows={5} 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="targetGroup"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Audience</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select target group" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all">All Students</SelectItem>
                      <SelectItem value="cs-year1">Computer Science - Year 1</SelectItem>
                      <SelectItem value="cs-year2">Computer Science - Year 2</SelectItem>
                      <SelectItem value="ba-year3">Business Administration - Year 3</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
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
                {isSubmitting ? 'Posting...' : 'Post Announcement'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
