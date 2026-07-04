'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
  parseISO,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Video, CalendarIcon, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface MeetingCalendarMeeting {
  id: string;
  projectName: string;
  date: string;
  status: 'completed' | 'processing' | 'failed' | 'not_admitted';
  platform: string;
}

interface GoogleCalendarEvent {
  id: string;
  title: string;
  start: string | null;
  end: string | null;
  hangoutLink: string | null;
  attendees: { email: string; displayName: string; responseStatus: string }[];
  location: string | null;
}

type CalendarItem = MeetingCalendarMeeting & {
  isGoogleEvent?: boolean;
  hangoutLink?: string | null;
  attendees?: { email: string; displayName: string; responseStatus: string }[];
  location?: string | null;
};

interface MeetingCalendarProps {
  meetings: MeetingCalendarMeeting[];
  onSelectMeeting: (meetingId: string) => void;
}

export function MeetingCalendar({ meetings, onSelectMeeting }: MeetingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [googleEvents, setGoogleEvents] = useState<GoogleCalendarEvent[]>([]);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleConnected, setGoogleConnected] = useState<boolean | null>(null);

  const fetchGoogleEvents = useCallback(async (month: Date) => {
    setGoogleLoading(true);
    try {
      const timeMin = new Date(month.getFullYear(), month.getMonth(), 1).toISOString();
      const timeMax = new Date(
        month.getFullYear(),
        month.getMonth() + 1,
        0,
        23,
        59,
        59
      ).toISOString();
      const res = await fetch(
        `/api/google/calendar-events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}`
      );
      if (res.status === 403) {
        setGoogleConnected(false);
        setGoogleEvents([]);
        return;
      }
      if (!res.ok) return;
      setGoogleConnected(true);
      const data = await res.json();
      setGoogleEvents(data.events ?? []);
    } catch {
      // silently fail — calendar still shows Syntheon Hub meetings
    } finally {
      setGoogleLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchGoogleEvents(currentMonth);
  }, [currentMonth, fetchGoogleEvents]);

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const itemsByDate = useMemo(() => {
    const map = new Map<string, CalendarItem[]>();
    for (const meeting of meetings) {
      const d = parseISO(meeting.date);
      const key = format(d, 'yyyy-MM-dd');
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(meeting);
    }
    for (const evt of googleEvents) {
      if (!evt.start) continue;
      const d = parseISO(evt.start);
      const key = format(d, 'yyyy-MM-dd');
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push({
        id: `gcal-${evt.id}`,
        projectName: evt.title,
        date: evt.start,
        status: 'not_admitted',
        platform: 'Google Calendar',
        isGoogleEvent: true,
        hangoutLink: evt.hangoutLink,
        attendees: evt.attendees,
        location: evt.location,
      });
    }
    for (const items of map.values()) {
      items.sort((a, b) => a.date.localeCompare(b.date));
    }
    return map;
  }, [meetings, googleEvents]);

  const selectedItems = useMemo(() => {
    if (!selectedDate) return [];
    const key = format(selectedDate, 'yyyy-MM-dd');
    return itemsByDate.get(key) ?? [];
  }, [selectedDate, itemsByDate]);

  function prevMonth() {
    setCurrentMonth((m) => subMonths(m, 1));
    setSelectedDate(null);
  }

  function nextMonth() {
    setCurrentMonth((m) => addMonths(m, 1));
    setSelectedDate(null);
  }

  const today = new Date();

  return (
    <div className="space-y-6">
      {/* Month navigator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-foreground min-w-[140px]">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
          {googleLoading && (
            <span className="text-[10px] text-muted-foreground animate-pulse">
              Syncing Google Calendar…
            </span>
          )}
          {googleConnected === false && !googleLoading && (
            <span className="text-[10px] text-muted-foreground">Google Calendar not connected</span>
          )}
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="h-8 w-8 rounded-lg border border-border bg-muted/50 flex items-center justify-center hover:bg-muted/70 transition-colors"
            >
              <ChevronLeft className="h-4 w-4 text-muted-foreground" />
            </button>
            <button
              onClick={nextMonth}
              className="h-8 w-8 rounded-lg border border-border bg-muted/50 flex items-center justify-center hover:bg-muted/70 transition-colors"
            >
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
            <button
              onClick={() => {
                setCurrentMonth(new Date());
                setSelectedDate(new Date());
              }}
              className="ml-2 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Today
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            Completed
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            Processing
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            Failed
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            Google Calendar
          </div>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="rounded-2xl border border-border bg-muted/50 overflow-hidden">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-border">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div
              key={day}
              className="py-2.5 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day) => {
            const key = format(day, 'yyyy-MM-dd');
            const dayItems = itemsByDate.get(key) ?? [];
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isTodayDate = isToday(day);
            const isSelected = selectedDate && isSameDay(day, selectedDate);

            return (
              <button
                key={key}
                onClick={() => setSelectedDate(isSelected ? null : day)}
                className={cn(
                  'relative min-h-[100px] p-2 border-b border-r border-border text-left transition-colors hover:bg-accent/30',
                  !isCurrentMonth && 'bg-muted/20 opacity-50',
                  isSelected && 'bg-primary/5',
                  isTodayDate && !isSelected && 'bg-primary/3'
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={cn(
                      'text-xs font-medium',
                      isTodayDate
                        ? 'h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px]'
                        : 'text-muted-foreground'
                    )}
                  >
                    {format(day, 'd')}
                  </span>
                  {dayItems.length > 0 && (
                    <span className="text-[10px] font-semibold text-primary bg-primary/10 rounded-full px-1.5 py-0.5">
                      {dayItems.length}
                    </span>
                  )}
                </div>

                {/* Item dots */}
                {dayItems.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {dayItems.slice(0, 4).map((item, i) => (
                      <span
                        key={i}
                        className={cn(
                          'h-1.5 w-1.5 rounded-full',
                          item.isGoogleEvent
                            ? 'bg-blue-500'
                            : item.status === 'completed'
                              ? 'bg-green-500'
                              : item.status === 'processing'
                                ? 'bg-amber-500'
                                : item.status === 'failed'
                                  ? 'bg-red-500'
                                  : 'bg-primary'
                        )}
                      />
                    ))}
                    {dayItems.length > 4 && (
                      <span className="text-[8px] text-muted-foreground leading-none">+</span>
                    )}
                  </div>
                )}

                {/* Item titles on hover / selected */}
                {dayItems.length > 0 && (
                  <div className="mt-1 space-y-0.5">
                    {dayItems.slice(0, 2).map((item) => (
                      <p
                        key={item.id}
                        className={cn(
                          'text-[10px] truncate leading-tight',
                          item.isGoogleEvent
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-foreground/80'
                        )}
                      >
                        {item.isGoogleEvent && (
                          <CalendarIcon className="inline h-2.5 w-2.5 mr-0.5" />
                        )}
                        {item.projectName}
                      </p>
                    ))}
                    {dayItems.length > 2 && (
                      <p className="text-[10px] text-muted-foreground">
                        +{dayItems.length - 2} more
                      </p>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day detail */}
      {selectedDate && selectedItems.length > 0 && (
        <div className="rounded-2xl border border-border bg-muted/50 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-playfair text-lg font-semibold text-foreground">
              {format(selectedDate, 'EEEE, MMMM do')}
            </h4>
            <span className="text-xs text-muted-foreground">
              {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {selectedItems.map((item) => (
              <div
                key={item.id}
                className={cn(
                  'rounded-xl border border-border bg-background p-4 transition-all',
                  item.isGoogleEvent
                    ? 'hover:border-blue-400/50 hover:shadow-sm'
                    : 'hover:border-primary/30 hover:shadow-sm'
                )}
              >
                {item.isGoogleEvent ? (
                  <a
                    href={item.hangoutLink || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <p className="font-medium text-sm text-foreground flex items-center gap-1.5">
                        <CalendarIcon className="h-3.5 w-3.5 text-blue-500" />
                        {item.projectName}
                      </p>
                      <Badge className="text-[10px] bg-blue-100 text-blue-800">
                        Google Calendar
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {item.hangoutLink ? (
                        <Video className="h-3 w-3" />
                      ) : (
                        <CalendarIcon className="h-3 w-3" />
                      )}
                      <span>{item.hangoutLink ? 'Google Meet' : 'Calendar event'}</span>
                      <span>•</span>
                      <span>{format(parseISO(item.date), 'h:mm a')}</span>
                      {item.hangoutLink && <ExternalLink className="h-3 w-3 ml-auto" />}
                    </div>
                    {item.attendees && item.attendees.length > 0 && (
                      <p className="text-[10px] text-muted-foreground mt-1.5">
                        {item.attendees.length} attendee{item.attendees.length > 1 ? 's' : ''}
                      </p>
                    )}
                  </a>
                ) : (
                  <button
                    onClick={() => onSelectMeeting(item.id)}
                    className="block w-full text-left"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <p className="font-medium text-sm text-foreground">{item.projectName}</p>
                      <Badge
                        className={cn(
                          'text-[10px]',
                          item.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : item.status === 'not_admitted'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-primary/10 text-primary'
                        )}
                      >
                        {item.status === 'not_admitted' ? '!' : item.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Video className="h-3 w-3" />
                      <span>{item.platform}</span>
                      <span>•</span>
                      <span>{format(parseISO(item.date), 'h:mm a')}</span>
                    </div>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedDate && selectedItems.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-muted/50 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No meetings on {format(selectedDate, 'MMMM do')}.
          </p>
        </div>
      )}
    </div>
  );
}
