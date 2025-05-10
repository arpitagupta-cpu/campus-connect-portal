import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import PostAnnouncementModal from "@/components/admin/PostAnnouncementModal";
import { Announcement } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Plus, 
  Calendar,
  Users,
  Bell,
  XCircle,
  Trash,
  Edit,
  Eye
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";

export default function AdminAnnouncements() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const { toast } = useToast();

  // Fetch announcements
  const { 
    data: announcements, 
    isLoading 
  } = useQuery<Announcement[]>({
    queryKey: ['/api/admin/announcements'],
  });

  const filteredAnnouncements = announcements?.filter(announcement => {
    return announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           announcement.content.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const viewAnnouncementDetails = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setIsDetailsModalOpen(true);
  };

  const deleteAnnouncement = async () => {
    if (!selectedAnnouncement) return;
    
    try {
      await apiRequest("DELETE", `/api/announcements/${selectedAnnouncement.id}`, undefined);
      
      toast({
        title: "Announcement Deleted",
        description: "The announcement has been successfully deleted.",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/admin/announcements'] });
      setIsDeleteConfirmOpen(false);
      setIsDetailsModalOpen(false);
    } catch (error) {
      console.error("Error deleting announcement:", error);
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: "There was an error deleting the announcement.",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return formatDate(dateString);
    }
  };

  return (
    <AdminLayout title="Announcements">
      {/* Header actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex-1 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              placeholder="Search announcements..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <Button className="w-full sm:w-auto" onClick={() => setIsAnnouncementModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Post Announcement
        </Button>
      </div>

      {/* Announcements List */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : filteredAnnouncements && filteredAnnouncements.length > 0 ? (
        <div className="space-y-4">
          {filteredAnnouncements.map((announcement) => (
            <Card 
              key={announcement.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => viewAnnouncementDetails(announcement)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-primary/10 rounded flex-shrink-0">
                      <Bell className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <h3 className="font-medium text-neutral-800">{announcement.title}</h3>
                        <span className="text-xs text-neutral-500">
                          {getRelativeTime(announcement.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-600 mt-1 line-clamp-2">{announcement.content}</p>
                      
                      <div className="flex items-center mt-3 text-xs text-neutral-500">
                        <span className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          Target: {announcement.targetGroup === 'all' ? 'All Students' : announcement.targetGroup}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <XCircle className="mx-auto h-12 w-12 text-neutral-300" />
          <h3 className="mt-2 text-lg font-medium text-neutral-800">No Announcements Found</h3>
          <p className="text-neutral-500">
            {searchQuery 
              ? "No announcements match your search criteria."
              : "You haven't posted any announcements yet."}
          </p>
          {!searchQuery && (
            <Button className="mt-4" onClick={() => setIsAnnouncementModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Post Announcement
            </Button>
          )}
        </div>
      )}

      {/* Post Announcement Modal */}
      <PostAnnouncementModal isOpen={isAnnouncementModalOpen} onClose={() => setIsAnnouncementModalOpen(false)} />

      {/* Announcement Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedAnnouncement?.title}</DialogTitle>
            <DialogDescription>
              Posted on {selectedAnnouncement && formatDate(selectedAnnouncement.createdAt)}
            </DialogDescription>
          </DialogHeader>
          
          {selectedAnnouncement && (
            <div className="mt-4">
              <div className="mb-6">
                <h4 className="text-sm font-medium text-neutral-700 mb-2">Announcement Content</h4>
                <div className="bg-neutral-50 p-4 rounded-md">
                  <p className="text-sm text-neutral-600 whitespace-pre-line">{selectedAnnouncement.content}</p>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="text-sm font-medium text-neutral-700 mb-1">Target Audience</h4>
                <p className="text-sm text-neutral-600 flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  {selectedAnnouncement.targetGroup === 'all' 
                    ? 'All Students' 
                    : selectedAnnouncement.targetGroup}
                </p>
              </div>
              
              <div className="pt-2 border-t border-neutral-200">
                <div className="flex justify-between text-sm text-neutral-500">
                  <span>Posted by</span>
                  <span>Administrator ID: {selectedAnnouncement.authorId}</span>
                </div>
              </div>
              
              <div className="flex justify-between mt-6">
                <div className="space-x-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => setIsDeleteConfirmOpen(true)}>
                    <Trash className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
                <Button onClick={() => setIsDetailsModalOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this announcement? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={deleteAnnouncement}>Delete Announcement</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
