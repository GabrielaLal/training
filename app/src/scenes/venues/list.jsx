import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { AiOutlineEnvironment, AiOutlineUser } from "react-icons/ai"
import api from "@/services/api"
import toast from "react-hot-toast"

export default function ListView() {
  const [venues, setVenues] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ search: "", city: "" })

  useEffect(() => {
    fetchVenues()
  }, [])

  const fetchVenues = async () => {
    try {
      setLoading(true)
      const { ok, data } = await api.post("/venue/search", {
        search: filters.search,
        city: filters.city,
        per_page: 20,
        page: 1
      })

      if (!ok) throw new Error("Failed to fetch venues")
      setVenues(data || [])
    } catch (error) {
      toast.error("Could not load venues")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = e => {
    e.preventDefault()
    fetchVenues()
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Info card */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Public Venue Search</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>This page displays all venues available in the system.</p>
              <p className="mt-1">
                Data comes from <code className="bg-blue-100 px-1 rounded">POST /venue/search</code> endpoint.
              </p>
              <p className="mt-1">
                <strong>Public route:</strong> No authentication required - anyone can browse venues.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <form onSubmit={handleSearch} className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Venue name, address, or city..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={filters.search}
              onChange={e => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input
              type="text"
              placeholder="Paris, Lyon..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={filters.city}
              onChange={e => setFilters({ ...filters, city: e.target.value })}
            />
          </div>
        </div>
        <button type="submit" className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
          Search Venues
        </button>
      </form>

      {/* Venues List */}
      {venues.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <AiOutlineEnvironment className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No venues found</h3>
          <p className="text-gray-600 mb-4">There are no venues matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {venues.map(venue => (
            <VenueCard key={venue._id} venue={venue} />
          ))}
        </div>
      )}
    </div>
  )
}

function VenueCard({ venue }) {
  return (
    <Link to={`/venue/${venue._id}`} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200 overflow-hidden block">
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{venue.name}</h3>

        <div className="space-y-2 text-sm text-gray-600">
          {venue.address && (
            <div className="flex items-center">
              <AiOutlineEnvironment className="w-4 h-4 mr-2" />
              <span className="line-clamp-1">
                {venue.address}
                {venue.city && `, ${venue.city}`}
              </span>
            </div>
          )}

          {venue.capacity > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Capacity</span>
                <span className="text-xs font-semibold text-gray-900">{venue.capacity} people</span>
              </div>
            </div>
          )}

          {venue.amenities && venue.amenities.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <div className="text-xs text-gray-500 mb-1">Amenities</div>
              <div className="flex flex-wrap gap-1">
                {venue.amenities.slice(0, 3).map((amenity, idx) => (
                  <span key={idx} className="text-xs px-2 py-1 bg-indigo-100 text-indigo-800 rounded">
                    {amenity}
                  </span>
                ))}
                {venue.amenities.length > 3 && <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">+{venue.amenities.length - 3} more</span>}
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
