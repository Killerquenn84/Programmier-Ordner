import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Event
} from '@mui/icons-material';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';
import { de } from 'date-fns/locale';

interface Appointment {
  _id: string;
  datum: string;
  uhrzeit: string;
  status: string;
  patientName?: string;
}

interface CalendarViewProps {
  appointments: Appointment[];
  onDateClick: (date: Date) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ appointments, onDateClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(appt => appt.datum === format(date, 'yyyy-MM-dd'));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'bestätigt':
        return 'success.main';
      case 'abgelehnt':
        return 'error.main';
      case 'abgesagt':
        return 'warning.main';
      default:
        return 'info.main';
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={prevMonth}>
          <ChevronLeft />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1, textAlign: 'center' }}>
          {format(currentDate, 'MMMM yyyy', { locale: de })}
        </Typography>
        <IconButton onClick={nextMonth}>
          <ChevronRight />
        </IconButton>
      </Box>

      <Grid container spacing={1}>
        {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((day) => (
          <Grid item xs key={day}>
            <Typography
              variant="subtitle2"
              align="center"
              sx={{ fontWeight: 'bold', mb: 1 }}
            >
              {day}
            </Typography>
          </Grid>
        ))}

        {days.map((day) => {
          const dayAppointments = getAppointmentsForDate(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isCurrentDay = isToday(day);

          return (
            <Grid item xs key={day.toString()}>
              <Box
                sx={{
                  p: 1,
                  height: 100,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: isCurrentDay ? 'action.selected' : 'background.paper',
                  opacity: isCurrentMonth ? 1 : 0.5,
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'action.hover'
                  }
                }}
                onClick={() => onDateClick(day)}
              >
                <Typography
                  variant="body2"
                  align="right"
                  sx={{ mb: 1 }}
                >
                  {format(day, 'd')}
                </Typography>
                {dayAppointments.map((appt) => (
                  <Tooltip
                    key={appt._id}
                    title={`${appt.uhrzeit} - ${appt.patientName || 'Termin'}`}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        mb: 0.5
                      }}
                    >
                      <Event
                        sx={{
                          fontSize: 12,
                          color: getStatusColor(appt.status)
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {appt.uhrzeit}
                      </Typography>
                    </Box>
                  </Tooltip>
                ))}
              </Box>
            </Grid>
          );
        })}
      </Grid>
    </Paper>
  );
};

export default CalendarView; 