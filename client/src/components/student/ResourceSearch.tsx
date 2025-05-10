import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, FileType, X } from "lucide-react";

interface ResourceSearchProps {
  onSearch: (results: any[]) => void;
}

// File types
const FILE_TYPES = [
  { value: "all", label: "All Types" },
  { value: "pdf", label: "PDF Documents" },
  { value: "ppt", label: "Presentations" },
  { value: "doc", label: "Word Documents" },
  { value: "image", label: "Images" },
  { value: "video", label: "Videos" },
  { value: "other", label: "Other" },
];

// Subject list
const SUBJECTS = [
  { value: "all", label: "All Subjects" },
  { value: "math", label: "Mathematics" },
  { value: "science", label: "Science" },
  { value: "history", label: "History" },
  { value: "english", label: "English" },
  { value: "computer", label: "Computer Science" },
  { value: "physics", label: "Physics" },
  { value: "chemistry", label: "Chemistry" },
  { value: "biology", label: "Biology" },
];

export default function ResourceSearch({ onSearch }: ResourceSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [fileType, setFileType] = useState("all");
  const [subject, setSubject] = useState("all");
  
  // Query to fetch filtered materials
  const { refetch, isLoading } = useQuery({
    queryKey: ['/api/materials/search', searchQuery, fileType, subject],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("q", searchQuery);
      if (fileType !== "all") params.append("type", fileType);
      if (subject !== "all") params.append("subject", subject);
      
      const response = await fetch(`/api/materials/search?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to search materials");
      }
      return response.json();
    },
    enabled: false, // Don't auto-fetch, wait for user to click search
    onSuccess: (data) => {
      onSearch(data);
    },
  });
  
  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };
  
  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery("");
    setFileType("all");
    setSubject("all");
  };
  
  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <Label htmlFor="search-query" className="mb-1.5 block text-sm">
              Search Materials
            </Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                id="search-query"
                type="text"
                placeholder="Search by title or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          
          <div className="w-full md:w-40">
            <Label htmlFor="file-type" className="mb-1.5 block text-sm">
              File Type
            </Label>
            <Select value={fileType} onValueChange={setFileType}>
              <SelectTrigger id="file-type">
                <FileType className="h-4 w-4 mr-2 text-gray-500" />
                <SelectValue placeholder="File Type" />
              </SelectTrigger>
              <SelectContent>
                {FILE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full md:w-40">
            <Label htmlFor="subject" className="mb-1.5 block text-sm">
              Subject
            </Label>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger id="subject">
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                {SUBJECTS.map((subj) => (
                  <SelectItem key={subj.value} value={subj.value}>
                    {subj.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex gap-2 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleClearFilters}
            disabled={isLoading}
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
          <Button type="submit" disabled={isLoading}>
            <Search className="h-4 w-4 mr-1" />
            Search
          </Button>
        </div>
      </form>
    </div>
  );
}