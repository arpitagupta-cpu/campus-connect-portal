import { Material } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, FileImage, FileArchive } from "lucide-react";

interface MaterialCardProps {
  material: Material;
  onClick?: () => void;
}

export default function MaterialCard({ material, onClick }: MaterialCardProps) {
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
    <Card 
      className={`hover:bg-neutral-50 transition-colors ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-4 flex items-center">
        <div className="mr-3 p-2 bg-primary/10 rounded">
          {getFileIcon(material.fileType)}
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-neutral-800">{material.title}</h3>
          <p className="text-xs text-neutral-500">
            {formatFileType(material.fileType)} • {formatFileSize(material.fileSize)}
          </p>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-primary hover:bg-primary/10 rounded"
          onClick={(e) => {
            e.stopPropagation();
            window.open(material.fileUrl, '_blank');
          }}
        >
          <Download className="h-5 w-5" />
        </Button>
      </CardContent>
    </Card>
  );
}
