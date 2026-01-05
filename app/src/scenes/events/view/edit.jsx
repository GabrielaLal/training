import React, { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import api from "@/services/api"
import toast from "react-hot-toast"

export default function EditTab({ event, fetchEvent }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [venues, setVenues] = useState([])
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    venue_id: "",
    capacity: 0,
    price: 0,
    currency: "EUR",
    category: "other",
    status: "draft"
  })

  useEffect(() => {
    fetchVenues()
  }, [])

  const fetchVenues = async () => {
    try {
      const { ok, data } = await api.post("/venue/search", {
        per_page: 100,
        page: 1
      })
      if (ok) {
        setVenues(data || [])
      }
    } catch (error) {
      console.error("Failed to fetch venues", error)
    }
  }

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || "",
        description: event.description || "",
        start_date: event.start_date ? new Date(event.start_date).toISOString().slice(0, 16) : "",
        end_date: event.end_date ? new Date(event.end_date).toISOString().slice(0, 16) : "",
        venue_id: event.venue_id?._id || event.venue_id || "",
        capacity: event.capacity || 0,
        price: event.price || 0,
        currency: event.currency || "EUR",
        category: event.category || "other",
        status: event.status || "draft"
      })
    }
  }, [event])

  const handleChange = e => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async e => {
    e.preventDefault()

    if (!formData.title || !formData.start_date || !formData.venue_id) {
      toast.error("Title, start date, and venue are required")
      return
    }

    try {
      setSaving(true)
      const { ok } = await api.put(`/event/${id}`, formData)
      if (!ok) throw new Error("Failed to update event")

      toast.success("Event updated successfully!")
      await fetchEvent() // Refresh the parent event data
      navigate(`/event/${id}`) // Navigate back to overview tab
    } catch (error) {
      toast.error(error.message || "Failed to update event")
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async () => {
    try {
      setSaving(true)
      const { ok } = await api.put(`/event/${id}`, { ...formData, status: "published" })
      if (!ok) throw new Error("Failed to publish event")

      toast.success("Event published successfully! 🎉")
      await fetchEvent() // Refresh the parent event data
      navigate(`/event/${id}`) // Navigate back to overview tab
    } catch (error) {
      toast.error(error.message || "Failed to publish event")
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  const isDraft = formData.status === "draft"

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        {/* Info card */}
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Two-Step Creation Pattern</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>
                  Common UX pattern: <strong>quick create → detailed edit → publish</strong>
                </p>
                <p className="mt-1">
                  Updates use <code className="bg-green-100 px-1 rounded">PUT /event/:id</code>
                </p>
                <p className="mt-1">
                  Fill in optional details, then click <strong>Publish Event</strong> to make it visible.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Status badge */}
        {isDraft && (
          <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400">
            <p className="text-sm text-yellow-800">
              📝 This event is a <strong>draft</strong> and not visible to the public. Complete the details and publish it.
            </p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., Annual Tech Conference 2025"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Describe your event, what attendees can expect, speakers, agenda..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="conference">Conference</option>
                <option value="workshop">Workshop</option>
                <option value="seminar">Seminar</option>
                <option value="networking">Networking</option>
                <option value="social">Social</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Date & Time */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Date & Time</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date & Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="start_date"
                required
                value={formData.start_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date & Time</label>
              <input
                type="datetime-local"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Location</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Venue <span className="text-red-500">*</span>
              </label>
              <select
                name="venue_id"
                required
                value={formData.venue_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select a venue</option>
                {venues.map(venue => (
                  <option key={venue._id} value={venue._id}>
                    {venue.name} - {venue.address}, {venue.city}, {venue.country}
                  </option>
                ))}
              </select>
              {event && event.venue_id && (
                <p className="mt-2 text-sm text-gray-600">
                  Current: {event.venue_id.name} - {event.venue_id.address}, {event.venue_id.city}, {event.venue_id.country}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Capacity & Pricing */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Capacity & Pricing</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capacity
                <span className="text-gray-500 text-xs ml-2">(0 = unlimited)</span>
              </label>
              <input
                type="number"
                name="capacity"
                min="0"
                value={formData.capacity}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price
                <span className="text-gray-500 text-xs ml-2">(0 = free)</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  name="price"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4">
          <button
            type="button"
            onClick={() => navigate("/my-events")}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Cancel
          </button>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save Draft"}
            </button>

            {isDraft && (
              <button
                type="button"
                onClick={handlePublish}
                disabled={saving}
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {saving ? "Publishing..." : "Publish Event"}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
