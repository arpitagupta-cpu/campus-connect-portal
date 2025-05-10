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
import FileUpload from "@/components/ui/file-upload";
import { insertMaterialSchema } from "@shared/schema";

interface UploadMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const formSchema = insertMaterialSchema.extend({});

type FormData = z.infer<typeof formSchema>;

export default function UploadMaterialModal({ isOpen, onClose }: UploadMaterialModalProps) {
  const [fileInfo, setFileInfo] = useState<{
    fileUrl: string;
    fileName: string;
    fileSize: number;
    fileType: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      fileUrl: "",
      fileType: "",
      fileSize: 0,
      targetGroup: "all",
      authorId: 1, // This would typically come from the current user
    },
  });

  const handleFileUploadComplete = (fileUrl: string, fileName: string, fileSize: number, fileType: string) => {
    setFileInfo({ fileUrl, fileName, fileSize, fileType });
    form.setValue("fileUrl", fileUrl);
    form.setValue("fileType", fileType);
    form.setValue("fileSize", fileSize);
  };

  const onSubmit = async (data: FormData) => {
    if (!fileInfo) {
      toast({
        variant: "destructive",
        title: "File Required",
        description: "Please upload a study material file",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      await apiRequest("POST", "/api/materials", data);
      
      toast({
        title: "Material Uploaded",
        description: "Study material has been successfully uploaded.",
      });

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/materials'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/activities'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      
      form.reset();
      setFileInfo(null);
      onClose();
    } catch (error) {
      console.error("Error uploading material:", error);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: "There was an error uploading the study material.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Study Material</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Material Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter title" {...field} />
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter description" 
                      rows={3} 
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
                  <FormLabel>Target Students</FormLabel>
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
            
            <FormField
              control={form.control}
              name="fileUrl"
              render={() => (
                <FormItem>
                  <FormLabel>Study Material File</FormLabel>
                  <FormControl>
                    <FileUpload 
                      onUploadComplete={handleFileUploadComplete}
                      acceptedFileTypes=".pdf,.doc,.docx,.ppt,.pptx,.zip"
                      maxFileSizeMB={20}
                      defaultInstructions="Upload study material (PDF, Document, Presentation)"
                    />
                  </FormControl>
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
                {isSubmitting ? 'Uploading...' : 'Upload Material'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
