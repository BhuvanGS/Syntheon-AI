'use client';

import { useMemo, useState } from 'react';
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
import { ChevronLeft, ChevronRight, Video } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface MeetingCalendarMeeting {
  id: string;
  projectName: string;
  date: string;
  status: 'completed' | 'processing' | 'failed' | 'not_admitted';
  platform: string;
}

interface MeetingCalendarProps {
  meetings: MeetingCalendarMeeting[];
  onSelectMeeting: (meetingId: string) => void;
}

export function MeetingCalendar({ meetings, onSelectMeeting }: MeetingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const meetingsByDate = useMemo(() => {
    const map = new Map<string, MeetingCalendarMeeting[]>();
    for (const meeting of meetings) {
      const d = parseISO(meeting.date);
      const key = format(d, 'yyyy-MM-dd');
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(meeting);
    }
    return map;
  }, [meetings]);

  const selectedMeetings = useMemo(() => {
    if (!selectedDate) return [];
    const key = format(selectedDate, 'yyyy-MM-dd');
    return meetingsByDate.get(key) ?? [];
  }, [selectedDate, meetingsByDate]);

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
            const dayMeetings = meetingsByDate.get(key) ?? [];
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
                  {dayMeetings.length > 0 && (
                    <span className="text-[10px] font-semibold text-primary bg-primary/10 rounded-full px-1.5 py-0.5">
                      {dayMeetings.length}
                    </span>
                  )}
                </div>

                {/* Meeting dots */}
                {dayMeetings.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {dayMeetings.slice(0, 4).map((m, i) => (
                      <span
                        key={i}
                        className={cn(
                          'h-1.5 w-1.5 rounded-full',
                          m.status === 'completed'
                            ? 'bg-green-500'
                            : m.status === 'processing'
                              ? 'bg-amber-500'
                              : m.status === 'failed'
                                ? 'bg-red-500'
                                : 'bg-primary'
                        )}
                      />
                    ))}
                    {dayMeetings.length > 4 && (
                      <span className="text-[8px] text-muted-foreground leading-none">+</span>
                    )}
                  </div>
                )}

                {/* Meeting titles on hover / selected */}
                {dayMeetings.length > 0 && (
                  <div className="mt-1 space-y-0.5">
                    {dayMeetings.slice(0, 2).map((m) => (
                      <p
                        key={m.id}
                        className="text-[10px] truncate text-foreground/80 leading-tight"
                      >
                        {m.projectName}
                      </p>
                    ))}
                    {dayMeetings.length > 2 && (
                      <p className="text-[10px] text-muted-foreground">
                        +{dayMeetings.length - 2} more
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
      {selectedDate && selectedMeetings.length > 0 && (
        <div className="rounded-2xl border border-border bg-muted/50 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-playfair text-lg font-semibold text-foreground">
              {format(selectedDate, 'EEEE, MMMM do')}
            </h4>
            <span className="text-xs text-muted-foreground">
              {selectedMeetings.length} meeting{selectedMeetings.length > 1 ? 's' : ''}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {selectedMeetings.map((meeting) => (
              <button
                key={meeting.id}
                onClick={() => onSelectMeeting(meeting.id)}
                className="text-left rounded-xl border border-border bg-background p-4 hover:border-primary/30 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <p className="font-medium text-sm text-foreground">{meeting.projectName}</p>
                  <Badge
                    className={cn(
                      'text-[10px]',
                      meeting.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : meeting.status === 'not_admitted'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-primary/10 text-primary'
                    )}
                  >
                    {meeting.status === 'not_admitted' ? '!' : meeting.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Video className="h-3 w-3" />
                  <span>{meeting.platform}</span>
                  <span>•</span>
                  <span>{format(parseISO(meeting.date), 'h:mm a')}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedDate && selectedMeetings.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-muted/50 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No meetings on {format(selectedDate, 'MMMM do')}.
          </p>
        </div>
      )}
    </div>
  );
}
