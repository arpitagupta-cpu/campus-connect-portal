import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, isToday, isSameMonth, isSameDay, parseISO } from "date-fns";
import StudentLayout from "@/components/layout/StudentLayout";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Calendar as CalendarIcon, FileText, ArrowRight, Clock, CheckCircle, XCircle } from "lucide-react";

interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  type: 'assignment';
  hasSubmitted?: boolean;
}

interface DetailedEvent extends CalendarEvent {
  description: string;
}

export default function StudentCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [month, setMonth] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<DetailedEvent | null>(null);
  const [isEventDetailsOpen, setIsEventDetailsOpen] = useState(false);
  
  // Fetch calendar events for the selected month
  const { 
    data: calendarEvents, 
    isLoading, 
    refetch: refetchCalendarEvents 
  } = useQuery<CalendarEvent[]>({
    queryKey: ['/api/calendar/events', month.getFullYear(), month.getMonth() + 1],
    queryFn: async () => {
      const res = await fetch(
        `/api/calendar/events?year=${month.getFullYear()}&month=${month.getMonth() + 1}`
      );
      if (!res.ok) throw new Error('Failed to fetch calendar events');
      return res.json();
    }
  });
  
  // Fetch events for the selected date
  const {
    data: dateEvents,
    isLoading: isDateEventsLoading,
    refetch: refetchDateEvents
  } = useQuery<DetailedEvent[]>({
    queryKey: ['/api/calendar/events/date', selectedDate],
    queryFn: async () => {
      if (!selectedDate) return [];
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      const res = await fetch(`/api/calendar/events/${dateString}`);
      if (!res.ok) throw new Error('Failed to fetch events for selected date');
      return res.json();
    },
    enabled: !!selectedDate
  });
  
  // Update the month when the calendar month changes
  const handleMonthChange = (date: Date) => {
    if (!isSameMonth(month, date)) {
      setMonth(date);
    }
  };
  
  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };
  
  // Handle event click
  const handleEventClick = (event: DetailedEvent) => {
    setSelectedEvent(event);
    setIsEventDetailsOpen(true);
  };
  
  // Get CSS classes for days with events
  const getDayClassName = (date: Date) => {
    if (!calendarEvents) return "";
    
    const hasEvent = calendarEvents.some(event => 
      isSameDay(date, parseISO(event.date as string))
    );
    
    const hasUnsubmittedEvent = calendarEvents.some(event => 
      isSameDay(date, parseISO(event.date as string)) && !event.hasSubmitted
    );
    
    if (hasUnsubmittedEvent) {
      return "bg-red-100 text-red-800 rounded-full font-bold";
    } else if (hasEvent) {
      return "bg-green-100 text-green-800 rounded-full font-bold";
    }
    
    return "";
  };
  
  // Effect to refetch date events when selected date changes
  useEffect(() => {
    if (selectedDate) {
      refetchDateEvents();
    }
  }, [selectedDate, refetchDateEvents]);
  
  return (
    <StudentLayout title="Calendar">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarIcon className="mr-2 h-5 w-5" />
                Interactive Calendar
              </CardTitle>
              <CardDescription>
                View your assignments and deadlines by date
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-80 w-full" />
              ) : (
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  onMonthChange={handleMonthChange}
                  className="rounded-md border shadow-sm"
                  modifiersClassNames={{
                    today: "bg-primary text-primary-foreground",
                  }}
                  modifiers={{
                    highlighted: (date) => {
                      return calendarEvents?.some(event => 
                        isSameDay(date, parseISO(event.date as string))
                      ) || false;
                    }
                  }}
                  // Custom day component not being used to avoid typescript issues
                  // Using modifiers and class names instead
                />
              )}
              
              <div className="mt-4 flex justify-center space-x-4">
                <div className="flex items-center">
                  <span className="w-3 h-3 rounded-full bg-green-100 border border-green-500 mr-2"></span>
                  <span className="text-xs text-gray-500">Submitted</span>
                </div>
                <div className="flex items-center">
                  <span className="w-3 h-3 rounded-full bg-red-100 border border-red-500 mr-2"></span>
                  <span className="text-xs text-gray-500">Pending</span>
                </div>
                <div className="flex items-center">
                  <span className="w-3 h-3 rounded-full bg-primary mr-2"></span>
                  <span className="text-xs text-gray-500">Today</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Events for selected date */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
              </CardTitle>
              <CardDescription>
                {isToday(selectedDate as Date) ? 'Today' : ''} Events and Deadlines
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isDateEventsLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : dateEvents && dateEvents.length > 0 ? (
                <div className="space-y-4">
                  {dateEvents.map((event) => (
                    <div 
                      key={`${event.type}-${event.id}`}
                      className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleEventClick(event)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{event.title}</h4>
                          <div className="flex items-center mt-1">
                            <Clock className="h-3 w-3 text-gray-400 mr-1" />
                            <span className="text-xs text-gray-500">
                              {format(parseISO(event.date as string), 'h:mm a')}
                            </span>
                          </div>
                        </div>
                        <div>
                          {event.type === 'assignment' && (
                            <Badge variant={event.hasSubmitted ? "success" : "destructive"}>
                              {event.hasSubmitted ? 'Submitted' : 'Pending'}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <XCircle className="mx-auto h-10 w-10 text-gray-300" />
                  <p className="mt-2 text-gray-500">No events for this date</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Event Details Dialog */}
      <Dialog open={isEventDetailsOpen} onOpenChange={setIsEventDetailsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
            <DialogDescription>
              {selectedEvent && format(parseISO(selectedEvent.date as string), 'MMMM d, yyyy')}
            </DialogDescription>
          </DialogHeader>
          
          {selectedEvent && (
            <div className="space-y-4">
              {selectedEvent.type === 'assignment' && (
                <div className="flex justify-between items-center">
                  <div className="text-sm">Status:</div>
                  <Badge variant={selectedEvent.hasSubmitted ? "success" : "destructive"}>
                    {selectedEvent.hasSubmitted ? 'Submitted' : 'Pending'}
                  </Badge>
                </div>
              )}
              
              <div>
                <h4 className="text-sm font-medium mb-1">Description:</h4>
                <p className="text-sm text-gray-600">{selectedEvent.description}</p>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsEventDetailsOpen(false)}
                >
                  Close
                </Button>
                {selectedEvent.type === 'assignment' && !selectedEvent.hasSubmitted && (
                  <Button 
                    size="sm"
                    onClick={() => {
                      // Navigate to assignments page with this assignment selected
                      window.location.href = `/student/assignments`;
                    }}
                  >
                    <ArrowRight className="h-4 w-4 mr-1" />
                    Go to Assignment
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </StudentLayout>
  );
}