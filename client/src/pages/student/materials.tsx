import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import StudentLayout from "@/components/layout/StudentLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Material } from "@shared/schema";
import { Download, Search, BookOpen, FileText, BookIcon, ArrowUpDown, XCircle } from "lucide-react";

export default function StudentMaterials() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch materials
  const { 
    data: materials, 
    isLoading 
  } = useQuery<Material[]>({
    queryKey: ['/api/materials'],
  });

  const openDetailsModal = (material: Material) => {
    setSelectedMaterial(material);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMaterial(null);
  };

  const filteredMaterials = materials?.filter(material => {
    const matchesSearch = material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        material.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || 
                          (selectedCategory === 'pdf' && material.fileType.includes('pdf')) ||
                          (selectedCategory === 'document' && (material.fileType.includes('doc') || material.fileType.includes('docx'))) ||
                          (selectedCategory === 'other' && !(material.fileType.includes('pdf') || material.fileType.includes('doc')));
    
    return matchesSearch && matchesCategory;
  });

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else if (fileType.includes('doc')) {
      return <FileText className="h-5 w-5 text-blue-500" />;
    } else if (fileType.includes('ppt')) {
      return <FileText className="h-5 w-5 text-amber-500" />;
    } else {
      return <FileText className="h-5 w-5 text-neutral-500" />;
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
    <StudentLayout title="Study Materials">
      <div className="mb-6">
        <h2 className="text-lg font-medium text-neutral-800 mb-3">Study Materials</h2>
        
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              placeholder="Search materials..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="max-w-xs">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pdf">PDF</TabsTrigger>
              <TabsTrigger value="document">Document</TabsTrigger>
              <TabsTrigger value="other">Other</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

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
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => openDetailsModal(material)}
              >
                <CardContent className="p-4 flex items-center">
                  <div className="mr-3 p-3 bg-primary/10 rounded">
                    {getFileIcon(material.fileType)}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h3 className="font-medium text-neutral-800 truncate">{material.title}</h3>
                    <p className="text-xs text-neutral-500 truncate">{material.description}</p>
                    <div className="flex text-xs text-neutral-500 mt-1">
                      <span className="mr-3">{formatFileType(material.fileType)} Document</span>
                      <span>{formatFileSize(material.fileSize)}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                    <Download className="h-4 w-4 text-primary" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <XCircle className="mx-auto h-12 w-12 text-neutral-300" />
            <h3 className="mt-2 text-lg font-medium text-neutral-800">No Materials Found</h3>
            <p className="text-neutral-500">No study materials match your search criteria.</p>
          </div>
        )}
      </div>

      {/* Material Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
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
              
              <Button className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </StudentLayout>
  );
}
