import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Send, RefreshCw, Bell } from "lucide-react";

interface ChatMessage {
  id: number;
  senderId: number;
  content: string;
  timestamp: string;
  isRead: boolean;
  sender: {
    id: number;
    username: string;
    fullName: string;
    role: string;
    profilePicture: string | null;
  };
}

export default function AdminChat() {
  const { currentUser } = useAuth();
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  
  // Fetch all chat messages
  const { data: messages, isLoading, refetch } = useQuery<ChatMessage[]>({
    queryKey: ['/api/chat/messages'],
    enabled: true,
    staleTime: 30000 // 30 seconds
  });
  
  // Get unread message count
  const { data: unreadCount } = useQuery<{ count: number }>({
    queryKey: ['/api/chat/messages/unread'],
    enabled: true,
    staleTime: 30000
  });
  
  // Send a new message
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!currentUser) {
        throw new Error('You must be logged in to send messages');
      }
      
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: (currentUser as any).id || 0,
          content,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat/messages'] });
      setNewMessage("");
    },
  });
  
  // Mark a message as read
  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: number) => {
      const response = await fetch(`/api/chat/messages/${messageId}/read`, {
        method: 'PUT',
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark message as read');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat/messages'] });
      queryClient.invalidateQueries({ queryKey: ['/api/chat/messages/unread'] });
    },
  });
  
  // Handle sending a new message
  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;
    sendMessageMutation.mutate(newMessage);
  };
  
  // Mark messages as read when they are viewed
  useEffect(() => {
    if (messages && currentUser && Array.isArray(messages)) {
      messages.forEach(message => {
        // Cast explicitly to avoid TypeScript errors
        const user = currentUser as any;
        if (!message.isRead && message.senderId !== user.id) {
          markAsReadMutation.mutate(message.id);
        }
      });
    }
  }, [messages, currentUser, markAsReadMutation]);
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  // Set up auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [refetch]);
  
  return (
    <AdminLayout title="Student Support Chat">
      <div className="flex flex-col space-y-4">
        <Card className="flex-1">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Student Support Chat</CardTitle>
                <CardDescription>
                  Answer student questions and provide support
                </CardDescription>
              </div>
              <div className="flex items-center gap-4">
                {unreadCount && unreadCount.count > 0 && (
                  <div className="flex items-center">
                    <Bell className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="text-sm font-medium">
                      {unreadCount.count} unread
                    </span>
                  </div>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => refetch()}
                  disabled={isLoading}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Messages Container */}
            <div className="border rounded-md h-[65vh] overflow-y-auto p-4 mb-4 bg-slate-50">
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : messages && Array.isArray(messages) && messages.length > 0 ? (
                <div className="space-y-4">
                  {messages.map((message) => {
                    // Cast explicitly to avoid TypeScript errors
                    const user = currentUser as any;
                    const isCurrentUser = message.senderId === user?.id;
                    const isStudent = message.sender.role === 'student';
                    
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} max-w-[80%] gap-2`}>
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={message.sender.profilePicture || undefined} />
                            <AvatarFallback>
                              {getInitials(message.sender.fullName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xs font-medium ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                                {message.sender.fullName}
                              </span>
                              {isStudent ? (
                                <Badge variant="warning">Student</Badge>
                              ) : (
                                <Badge>Admin</Badge>
                              )}
                              {!message.isRead && !isCurrentUser && (
                                <Badge variant="destructive" className="text-xs">New</Badge>
                              )}
                            </div>
                            <div
                              className={`p-3 rounded-lg ${
                                isCurrentUser
                                  ? 'bg-primary text-white rounded-tr-none'
                                  : 'bg-gray-200 text-gray-800 rounded-tl-none'
                              }`}
                            >
                              <p className="whitespace-pre-wrap break-words">{message.content}</p>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {format(new Date(message.timestamp), 'MMM d, h:mm a')}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <p className="text-gray-500 mb-2">No messages yet</p>
                  <p className="text-sm text-gray-400">
                    Students will send questions here when they need help
                  </p>
                </div>
              )}
            </div>
            
            {/* Message Input */}
            <div className="flex gap-2 mt-2">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your reply here..."
                className="flex-1 resize-none"
                rows={2}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={sendMessageMutation.isPending || newMessage.trim() === ""}
              >
                {sendMessageMutation.isPending ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Send
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}