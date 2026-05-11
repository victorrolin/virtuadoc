'use server'

import { createClient } from '@/lib/supabase/server'
import { addDays, format, getDay, parse, isBefore, startOfDay } from 'date-fns'

export async function getDoctorAvailableSlots(doctorId: string, daysAhead: number = 7) {
  const supabase = await createClient()

  // 1. Pegar a agenda (configuração de dias de semana)
  const { data: schedules } = await supabase
    .from('doctor_schedules')
    .select('*')
    .eq('doctor_id', doctorId)

  if (!schedules || schedules.length === 0) {
    return []
  }

  // 2. Pegar todas as consultas agendadas nos próximos `daysAhead` dias
  const startDate = new Date()
  const endDate = addDays(startDate, daysAhead)

  const { data: appointments } = await supabase
    .from('appointments')
    .select('appointment_date, start_time')
    .eq('doctor_id', doctorId)
    .gte('appointment_date', format(startDate, 'yyyy-MM-dd'))
    .lte('appointment_date', format(endDate, 'yyyy-MM-dd'))
    .neq('status', 'cancelled')

  const availableDays = []

  // 3. Para cada um dos próximos X dias, ver se o médico atende e gerar os slots
  for (let i = 0; i < daysAhead; i++) {
    const currentDate = addDays(startDate, i)
    const dayOfWeek = getDay(currentDate) // 0 (Domingo) a 6 (Sábado)

    const scheduleForDay = schedules.find((s) => s.day_of_week === dayOfWeek)

    if (scheduleForDay) {
      const dateString = format(currentDate, 'yyyy-MM-dd')
      const slots = []
      
      // Gerar blocos de horários (ex: 08:00, 08:30, 09:00...)
      let currentSlot = parse(scheduleForDay.start_time, 'HH:mm:ss', currentDate)
      const endTime = parse(scheduleForDay.end_time, 'HH:mm:ss', currentDate)

      while (isBefore(currentSlot, endTime)) {
        const timeString = format(currentSlot, 'HH:mm')
        const timeStringSeconds = format(currentSlot, 'HH:mm:ss')

        // Verificar se já tem consulta nesse dia/horário exato
        const isBooked = appointments?.some(
          (apt) => apt.appointment_date === dateString && apt.start_time.startsWith(timeString)
        )

        // Se for hoje, não mostrar horários do passado
        const isPast = isBefore(currentSlot, new Date())

        if (!isBooked && !isPast) {
          slots.push(timeString)
        }

        // Avançar o tempo (slot_duration_minutes)
        currentSlot = new Date(currentSlot.getTime() + scheduleForDay.slot_duration_minutes * 60000)
      }

      if (slots.length > 0) {
        availableDays.push({
          date: dateString,
          formattedDate: format(currentDate, 'dd/MM/yyyy'),
          dayName: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][dayOfWeek],
          slots
        })
      }
    }
  }

  return availableDays
}
