import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UploadMaterialModal from "@/components/admin/UploadMaterialModal";
import { Material } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Plus, 
  FileText,
  FileImage,
  FileArchive,
  Calendar,
  Download,
  XCircle,
  Trash,
  Eye,
  Edit
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";

export default function AdminMaterials() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const { toast } = useToast();

  // Fetch materials
  const { 
    data: materials, 
    isLoading 
  } = useQuery<Material[]>({
    queryKey: ['/api/admin/materials'],
  });

  const filteredMaterials = materials?.filter(material => {
    const matchesSearch = material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        material.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedType === 'all' || 
                      (selectedType === 'pdf' && material.fileType.includes('pdf')) ||
                      (selectedType === 'document' && (material.fileType.includes('doc') || material.fileType.includes('docx'))) ||
                      (selectedType === 'presentation' && material.fileType.includes('ppt')) ||
                      (selectedType === 'other' && !(
                        material.fileType.includes('pdf') || 
                        material.fileType.includes('doc') || 
                        material.fileType.includes('ppt')
                      ));
    
    return matchesSearch && matchesType;
  });

  const viewMaterialDetails = (material: Material) => {
    setSelectedMaterial(material);
    setIsDetailsModalOpen(true);
  };

  const deleteMaterial = async () => {
    if (!selectedMaterial) return;
    
    try {
      await apiRequest("DELETE", `/api/materials/${selectedMaterial.id}`, undefined);
      
      toast({
        title: "Material Deleted",
        description: "The study material has been successfully deleted.",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/admin/materials'] });
      setIsDeleteConfirmOpen(false);
      setIsDetailsModalOpen(false);
    } catch (error) {
      console.error("Error deleting material:", error);
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: "There was an error deleting the study material.",
      });
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else if (fileType.includes('doc')) {
      return <FileText className="h-5 w-5 text-blue-500" />;
    } else if (fileType.includes('ppt')) {
      return <FileText className="h-5 w-5 text-amber-500" />;
    } else if (fileType.includes('jpg') || fileType.includes('png') || fileType.includes('jpeg')) {
      return <FileImage className="h-5 w-5 text-green-500" />;
    } else {
      return <FileArchive className="h-5 w-5 text-neutral-500" />;
    }
  };

  const formatFileSize = (sizeInBytes: number) => {
    if (sizeInBytes < 1024) return `${sizeInBytes} B`;
    if (sizeInBytes < 1024 * 1024) return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatFileType = (fileType: string) => {
    return fileType.toUpperCase().replace(/^\./, '');
  };

  return (
    <AdminLayout title="Study Materials">
      {/* Header actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex-1 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              placeholder="Search materials..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <Button className="w-full sm:w-auto" onClick={() => setIsUploadModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Upload Material
        </Button>
      </div>
      
      {/* Type filter */}
      <Tabs defaultValue="all" value={selectedType} onValueChange={setSelectedType} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Types</TabsTrigger>
          <TabsTrigger value="pdf">PDF</TabsTrigger>
          <TabsTrigger value="document">Document</TabsTrigger>
          <TabsTrigger value="presentation">Presentation</TabsTrigger>
          <TabsTrigger value="other">Other</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Materials List */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : filteredMaterials && filteredMaterials.length > 0 ? (
        <div className="space-y-3">
          {filteredMaterials.map((material) => (
            <Card 
              key={material.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => viewMaterialDetails(material)}
            >
              <CardContent className="p-4 flex items-center">
                <div className="mr-3 p-3 bg-primary/10 rounded flex-shrink-0">
                  {getFileIcon(material.fileType)}
                </div>
                <div className="flex-1 overflow-hidden">
                  <h3 className="font-medium text-neutral-800 truncate">{material.title}</h3>
                  <p className="text-xs text-neutral-500 truncate">{material.description}</p>
                  <div className="flex text-xs text-neutral-500 mt-1">
                    <span className="mr-3">{formatFileType(material.fileType)}</span>
                    <span className="mr-3">{formatFileSize(material.fileSize)}</span>
                    <span className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(material.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="hover:bg-primary/10" asChild>
                  <a 
                    href={material.fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Download className="h-4 w-4 text-primary" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <XCircle className="mx-auto h-12 w-12 text-neutral-300" />
          <h3 className="mt-2 text-lg font-medium text-neutral-800">No Materials Found</h3>
          <p className="text-neutral-500">
            {searchQuery 
              ? "No materials match your search criteria."
              : "You haven't uploaded any study materials yet."}
          </p>
          {!searchQuery && (
            <Button className="mt-4" onClick={() => setIsUploadModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Upload Material
            </Button>
          )}
        </div>
      )}

      {/* Upload Material Modal */}
      <UploadMaterialModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} />

      {/* Material Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedMaterial?.title}</DialogTitle>
            <DialogDescription>
              Study Material Details
            </DialogDescription>
          </DialogHeader>
          
          {selectedMaterial && (
            <div className="mt-4">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-primary/10 rounded mr-3">
                  {getFileIcon(selectedMaterial.fileType)}
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {formatFileType(selectedMaterial.fileType)} Document
                  </p>
                  <p className="text-xs text-neutral-500">
                    {formatFileSize(selectedMaterial.fileSize)}
                  </p>
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-neutral-700 mb-1">Description</h4>
                <p className="text-sm text-neutral-600">{selectedMaterial.description}</p>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-neutral-700 mb-1">Target Group</h4>
                <p className="text-sm text-neutral-600">
                  {selectedMaterial.targetGroup === 'all' ? 'All Students' : selectedMaterial.targetGroup}
                </p>
              </div>
              
              <div className="mb-4 pt-2 border-t border-neutral-200">
                <div className="flex justify-between text-sm text-neutral-500">
                  <span>Uploaded on</span>
                  <span>
                    {new Date(selectedMaterial.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between">
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
                <Button asChild>
                  <a 
                    href={selectedMaterial.fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </a>
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
              Are you sure you want to delete this study material? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={deleteMaterial}>Delete Material</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
