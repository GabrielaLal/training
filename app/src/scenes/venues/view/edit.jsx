import React, { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import api from "@/services/api"
import toast from "react-hot-toast"

export default function EditTab({ venue, fetchVenue }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    country: "",
    capacity: 0,
    amenities: []
  })
  const [amenityInput, setAmenityInput] = useState("")

  useEffect(() => {
    if (venue) {
      setFormData({
        name: venue.name || "",
        address: venue.address || "",
        city: venue.city || "",
        country: venue.country || "",
        capacity: venue.capacity || 0,
        amenities: venue.amenities || []
      })
    }
  }, [venue])

  const handleChange = e => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleAddAmenity = () => {
    if (amenityInput.trim() && !formData.amenities.includes(amenityInput.trim())) {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, amenityInput.trim()]
      })
      setAmenityInput("")
    }
  }

  const handleRemoveAmenity = amenityToRemove => {
    setFormData({
      ...formData,
      amenities: formData.amenities.filter(a => a !== amenityToRemove)
    })
  }

  const handleSubmit = async e => {
    e.preventDefault()

    if (!formData.name || !formData.address || !formData.city || !formData.country) {
      toast.error("Name, address, city, and country are required")
      return
    }

    try {
      setSaving(true)
      const { ok } = await api.put(`/venue/${id}`, formData)
      if (!ok) throw new Error("Failed to update venue")

      toast.success("Venue updated successfully!")
      await fetchVenue() // Refresh the parent venue data
      navigate(`/venue/${id}`) // Navigate back to overview tab
    } catch (error) {
      toast.error(error.message || "Failed to update venue")
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Venue Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., Grand Convention Center"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="address"
                required
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., 123 Main Street"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="city"
                required
                value={formData.city}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., Paris"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="country"
                required
                value={formData.country}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., France"
              />
            </div>
          </div>
        </div>

        {/* Capacity */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Capacity</h2>

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
        </div>

        {/* Amenities */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Amenities</h2>

          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={amenityInput}
                onChange={e => setAmenityInput(e.target.value)}
                onKeyPress={e => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddAmenity()
                  }
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., WiFi, Parking, Catering..."
              />
              <button
                type="button"
                onClick={handleAddAmenity}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Add
              </button>
            </div>

            {formData.amenities.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.amenities.map((amenity, idx) => (
                  <span key={idx} className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-800 rounded text-sm">
                    {amenity}
                    <button type="button" onClick={() => handleRemoveAmenity(amenity)} className="text-indigo-600 hover:text-indigo-800">
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4">
          <button
            type="button"
            onClick={() => navigate("/my-venues")}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Venue"}
          </button>
        </div>
      </form>
    </div>
  )
}
