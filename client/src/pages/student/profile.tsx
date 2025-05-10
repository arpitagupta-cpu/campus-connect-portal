import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import StudentLayout from "@/components/layout/StudentLayout";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { UserCircle, Camera } from "lucide-react";

// Form schema for profile updates
const formSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Must be a valid email address"),
  phoneNumber: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function StudentProfile() {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch user data
  const { data: userData, isLoading } = useQuery({
    queryKey: ["/api/users", currentUser?.uid],
    queryFn: async () => {
      if (!currentUser?.uid) return null;
      const response = await apiRequest("GET", `/api/users/${currentUser.uid}`);
      return response.json() as Promise<User>;
    },
    enabled: !!currentUser?.uid,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
    },
  });

  // Update form values when user data is loaded
  useEffect(() => {
    if (userData) {
      form.reset({
        fullName: userData.fullName,
        email: userData.email,
        phoneNumber: userData.phoneNumber || "",
      });
      setProfilePicture(userData.profilePicture || null);
    }
  }, [userData, form]);

  // Handle profile updates
  const updateProfileMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (!currentUser?.uid) throw new Error("Not authenticated");
      const response = await apiRequest("PATCH", `/api/users/${currentUser.uid}`, values);
      return response.json() as Promise<User>;
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users", currentUser?.uid] });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: `Failed to update profile: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle profile picture upload
  const uploadProfilePicture = useMutation({
    mutationFn: async (profilePicture: string) => {
      if (!currentUser?.uid) throw new Error("Not authenticated");
      const response = await apiRequest(
        "PATCH", 
        `/api/users/${currentUser.uid}/profile-picture`, 
        { profilePicture }
      );
      return response.json() as Promise<User>;
    },
    onSuccess: () => {
      toast({
        title: "Profile Picture Updated",
        description: "Your profile picture has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users", currentUser?.uid] });
      setIsUploading(false);
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: `Failed to upload profile picture: ${error.message}`,
        variant: "destructive",
      });
      setIsUploading(false);
    },
  });

  const onSubmit = (values: FormValues) => {
    updateProfileMutation.mutate(values);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setProfilePicture(base64String);
      uploadProfilePicture.mutate(base64String);
    };
    reader.readAsDataURL(file);
  };

  if (isLoading) {
    return (
      <StudentLayout title="Profile">
        <div className="flex justify-center items-center h-[50vh]">
          <LoadingSpinner size="lg" />
        </div>
      </StudentLayout>
    );
  }

  // Get first letter of name for avatar fallback
  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <StudentLayout title="Profile">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">My Profile</CardTitle>
            <CardDescription>
              View and edit your personal information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center mb-8">
              <div className="relative">
                <Avatar className="w-24 h-24 border-4 border-white shadow-md">
                  <AvatarImage src={profilePicture || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                    {userData ? getInitials(userData.fullName) : <UserCircle />}
                  </AvatarFallback>
                </Avatar>
                
                <div className="absolute bottom-0 right-0 bg-primary text-white p-1 rounded-full cursor-pointer">
                  <label htmlFor="profile-picture" className="cursor-pointer">
                    <Camera size={16} />
                    <input 
                      type="file" 
                      id="profile-picture" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
                
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-full">
                    <LoadingSpinner size="sm" />
                  </div>
                )}
              </div>
              
              <h3 className="mt-4 text-lg font-medium">
                {userData?.fullName}
              </h3>
              <p className="text-sm text-muted-foreground">
                Student ID: {userData?.id}
              </p>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Your email address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Your phone number (optional)" {...field} />
                      </FormControl>
                      <FormDescription>
                        This will be used for important communications only
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Saving...
                    </>
                  ) : "Save Changes"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </StudentLayout>
  );
}