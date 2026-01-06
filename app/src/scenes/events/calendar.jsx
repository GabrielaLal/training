import React, { useEffect, useMemo, useState } from "react"
import { AiOutlineCalendar, AiOutlineLeft, AiOutlineRight } from "react-icons/ai"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"

import api from "@/services/api"
import useStore from "@/services/store"

const categoryColors = {
  conference: "bg-blue-600",
  workshop: "bg-cyan-500",
  seminar: "bg-green-500",
  networking: "bg-amber-500",
  social: "bg-pink-500",
  other: "bg-purple-500"
}

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export default function CalendarView() {
  const navigate = useNavigate()
  const { user } = useStore()

  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const { ok, data } = await api.post("/event/search", {
        per_page: 200,
        page: 1,
        sort: { start_date: 1 }
      })
      if (!ok) throw new Error("Failed to load events")
      setEvents(data || [])
    } catch (error) {
      toast.error("Could not load events")
    } finally {
      setLoading(false)
    }
  }

  const eventsByDate = useMemo(() => {
    const map = {}
    events.forEach(event => {
      const dateKey = new Date(event.start_date).toISOString().slice(0, 10)
      const organizerId = typeof event.organizer_id === "object" ? event.organizer_id?._id : event.organizer_id
      const isMine = Boolean(user && organizerId && organizerId.toString() === user._id)
      map[dateKey] = map[dateKey] || []
      map[dateKey].push({ ...event, isMine })
    })
    return map
  }, [events, user])

  const days = useMemo(() => {
    const { year, month } = currentMonth
    const firstDay = new Date(year, month, 1)
    const startWeekday = firstDay.getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const totalCells = 42
    const grid = []

    for (let i = 0; i < totalCells; i++) {
      const dayNumber = i - startWeekday + 1
      const date = new Date(year, month, dayNumber)
      const inCurrentMonth = dayNumber >= 1 && dayNumber <= daysInMonth
      const key = date.toISOString().slice(0, 10)
      grid.push({
        key,
        date,
        inCurrentMonth,
        isToday: isSameDate(date, new Date()),
        events: eventsByDate[key] || []
      })
    }
    return grid
  }, [currentMonth, eventsByDate])

  const goToMonth = delta => {
    setCurrentMonth(prev => {
      const nextDate = new Date(prev.year, prev.month + delta, 1)
      return { year: nextDate.getFullYear(), month: nextDate.getMonth() }
    })
  }

  const handleEventClick = eventId => {
    navigate(`/event/${eventId}`)
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar View</h1>
          <p className="text-sm text-gray-600">Monthly grid with your events. Click a tile to open the event.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => goToMonth(-1)} className="h-9 w-9 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center">
            <AiOutlineLeft className="h-5 w-5 text-gray-700" />
          </button>
          <div className="text-sm font-medium text-gray-900">
            {monthNames[currentMonth.month]} {currentMonth.year}
          </div>
          <button onClick={() => goToMonth(1)} className="h-9 w-9 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center">
            <AiOutlineRight className="h-5 w-5 text-gray-700" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-7 gap-3">
              {[...Array(14)].map((_, idx) => (
                <div key={idx} className="h-24 bg-gray-100 rounded" />
              ))}
            </div>
          </div>
        </div>
      ) : events.length === 0 ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center bg-white shadow">
          <AiOutlineCalendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming events</h3>
          <p className="text-sm text-gray-600">Publish an event to see it on the calendar.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="grid grid-cols-7 text-xs font-semibold text-gray-500 border-b border-gray-200">
            {weekdayNames.map(day => (
              <div key={day} className="px-4 py-3 uppercase tracking-wide text-center">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-px bg-gray-200">
            {days.map(day => (
              <div
                key={day.key}
                className={`bg-white min-h-[120px] p-2 flex flex-col gap-2 ${!day.inCurrentMonth ? "text-gray-300 bg-gray-50" : ""} ${day.isToday ? "border-2 border-blue-400" : ""}`}
              >
                <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
                  <span>{day.date.getDate()}</span>
                  {!day.inCurrentMonth && <span className="text-[10px] text-gray-400">•</span>}
                </div>

                <div className="space-y-1">
                  {day.events.slice(0, 3).map(event => {
                    const colorClass = categoryColors[event.category] || categoryColors.other
                    return (
                      <button key={event._id} onClick={() => handleEventClick(event._id)} className="w-full text-left" title={event.title}>
                        <div className={`rounded px-2 py-1 text-[11px] text-white leading-tight ${colorClass}`}>
                          <div className="flex items-center justify-between gap-1">
                            <p className="font-semibold truncate">{event.title}</p>
                            {event.isMine && <span className="shrink-0 rounded-full bg-white/20 px-1.5 py-[1px] text-[9px] font-semibold uppercase tracking-wide">My event</span>}
                          </div>
                          {event.venue_name && <p className="truncate opacity-90">{event.venue_name}</p>}
                        </div>
                      </button>
                    )
                  })}
                  {day.events.length > 3 && <div className="text-[11px] text-gray-500">+ {day.events.length - 3} more</div>}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 px-6 py-4 grid gap-3 md:grid-cols-3 bg-gray-50">
            {Object.entries(categoryColors).map(([key, colorClass]) => (
              <LegendItem key={key} colorClass={colorClass} label={key.charAt(0).toUpperCase() + key.slice(1)} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function LegendItem({ colorClass, label }) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-700">
      <span className={`w-3 h-3 rounded-sm ${colorClass}`} />
      <span>{label}</span>
    </div>
  )
}

function isSameDate(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}
