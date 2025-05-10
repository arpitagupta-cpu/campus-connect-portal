import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, X, FileText, File } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onUploadComplete: (fileUrl: string, fileName: string, fileSize: number, fileType: string) => void;
  acceptedFileTypes?: string;
  maxFileSizeMB?: number;
  defaultInstructions?: string;
}

export default function FileUpload({
  onUploadComplete,
  acceptedFileTypes = ".pdf,.doc,.docx,.ppt,.pptx,.zip",
  maxFileSizeMB = 10,
  defaultInstructions = "Click to upload or drag and drop",
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const maxSizeInBytes = maxFileSizeMB * 1024 * 1024;

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    // Check file size
    if (file.size > maxSizeInBytes) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: `File size must be less than ${maxFileSizeMB}MB`,
      });
      return;
    }

    // Check file type
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    if (!acceptedFileTypes.includes(fileExtension)) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: `File must be one of the following types: ${acceptedFileTypes}`,
      });
      return;
    }

    setFile(file);
  };

  const uploadFile = async () => {
    if (!file) return;
    
    try {
      setUploading(true);
      
      // Simulate upload progress (in a real app, this would use firebase storage)
      for (let i = 0; i <= 100; i += 10) {
        setProgress(i);
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
      
      // In a real app, this would return the download URL from Firebase Storage
      const mockFileUrl = `https://example.com/files/${file.name}`;
      
      onUploadComplete(mockFileUrl, file.name, file.size, file.type);
      
      toast({
        title: "Upload complete",
        description: `${file.name} has been uploaded successfully.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "There was an error uploading your file.",
      });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getFileIcon = () => {
    if (!file) return <Upload className="h-10 w-10 text-neutral-400" />;
    
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (['pdf'].includes(extension!)) {
      return <FileText className="h-10 w-10 text-red-500" />;
    } else if (['doc', 'docx'].includes(extension!)) {
      return <FileText className="h-10 w-10 text-blue-500" />;
    } else {
      return <File className="h-10 w-10 text-neutral-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="w-full">
      <Card
        className={`border-2 border-dashed ${
          file ? 'border-primary/40' : 'border-neutral-300'
        } rounded-md hover:border-primary/70 transition-colors cursor-pointer`}
        onClick={() => !file && !uploading && fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="p-6 flex flex-col items-center justify-center">
          {!file ? (
            <>
              {getFileIcon()}
              <p className="mt-2 text-sm text-neutral-600">{defaultInstructions}</p>
              <p className="text-xs text-neutral-500 mt-1">
                {acceptedFileTypes.replace(/\./g, '').toUpperCase()} (Max. {maxFileSizeMB}MB)
              </p>
            </>
          ) : (
            <div className="w-full">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  {getFileIcon()}
                  <div>
                    <p className="text-sm font-medium text-neutral-800 truncate max-w-[200px]">
                      {file.name}
                    </p>
                    <p className="text-xs text-neutral-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                {!uploading && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile();
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              {uploading ? (
                <div className="mt-2 w-full">
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-neutral-500 mt-1">Uploading... {progress}%</p>
                </div>
              ) : (
                <Button 
                  size="sm" 
                  className="mt-2 w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    uploadFile();
                  }}
                >
                  Upload File
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept={acceptedFileTypes}
        onChange={handleFileChange}
        disabled={uploading}
      />
    </div>
  );
}
