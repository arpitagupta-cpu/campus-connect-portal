import { Announcement } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Bell } from "lucide-react";

interface AnnouncementCardProps {
  announcement: Announcement;
  onClick?: () => void;
}

export default function AnnouncementCard({ announcement, onClick }: AnnouncementCardProps) {
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
      return date.toLocaleDateString();
    }
  };

  return (
    <Card 
      className={`border-b border-neutral-100 hover:shadow-sm transition-shadow ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-primary/10 rounded-md flex-shrink-0">
              <Bell className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-neutral-800">{announcement.title}</h3>
              <p className="text-sm text-neutral-600 mt-1 line-clamp-2">{announcement.content}</p>
            </div>
          </div>
          <span className="text-xs text-neutral-500 flex-shrink-0 ml-2">
            {getRelativeTime(announcement.createdAt)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
