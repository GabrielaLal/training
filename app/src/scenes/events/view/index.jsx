import React, { useEffect, useState } from "react"
import { Routes, Route, useParams, useNavigate } from "react-router-dom"
import api from "@/services/api"
import toast from "react-hot-toast"
import useStore from "@/services/store"
import OverviewTab from "./overview"
import EditTab from "./edit"
import AttendeesTab from "./attendees"
import PaymentsTab from "./payments"
import RawView from "./raw"

export default function EventView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useStore()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvent()
  }, [id])

  const fetchEvent = async () => {
    try {
      const { ok, data } = await api.get(`/event/${id}`)
      if (!ok) throw new Error("Failed to fetch event")
      setEvent(data)
    } catch (error) {
      toast.error("Could not load event")
      navigate("/")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (!event) return null

  const isOrganizer = user && event.organizer_id === user._id

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-8">
          <button onClick={() => navigate(`/event/${id}`)} className="pb-3 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            Overview
          </button>
          {isOrganizer && (
            <button onClick={() => navigate(`/event/${id}/edit`)} className="pb-3 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Edit
            </button>
          )}
          <button onClick={() => navigate(`/event/${id}/attendees`)} className="pb-3 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            Attendees
          </button>
          <button onClick={() => navigate(`/event/${id}/payments`)} className="pb-3 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            Payments
          </button>
          <button onClick={() => navigate(`/event/${id}/raw`)} className="pb-3 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            Raw
          </button>
        </div>
      </div>

      {/* Content */}
      <Routes>
        <Route index element={<OverviewTab event={event} />} />
        <Route path="edit" element={<EditTab event={event} fetchEvent={fetchEvent} />} />
        <Route path="attendees" element={<AttendeesTab eventId={id} />} />
        <Route path="payments" element={<PaymentsTab eventId={id} />} />
        <Route path="raw" element={<RawView event={event} />} />
      </Routes>
    </div>
  )
}
