import React from "react"

export default function OverviewTab({ event }) {
  const formatDate = date => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  return (
    <div className="max-w-3xl">
      {/* Event Details */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Event Details</h2>
        <div className="space-y-4">
          <div>
            <div className="text-sm font-medium text-gray-500">Description</div>
            <div className="text-sm text-gray-900 mt-1">{event.description || "No description"}</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-gray-500">Start Date</div>
              <div className="text-sm text-gray-900 mt-1">{formatDate(event.start_date)}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">End Date</div>
              <div className="text-sm text-gray-900 mt-1">{event.end_date ? formatDate(event.end_date) : "N/A"}</div>
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Location</div>
            <div className="text-sm text-gray-900 mt-1">
              {event.venue_name ? (
                <>
                  {event.venue_name}
                  {event.venue_address && `, ${event.venue_address}`}
                  {event.venue_city && `, ${event.venue_city}`}
                  {event.venue_country && `, ${event.venue_country}`}
                </>
              ) : (
                "Not specified"
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-gray-500">Capacity</div>
              <div className="text-sm text-gray-900 mt-1">{event.capacity ? `${event.available_spots} / ${event.capacity} available` : "Unlimited"}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Price</div>
              <div className="text-sm text-gray-900 mt-1">{event.price > 0 ? `${event.price} ${event.currency}` : "Free"}</div>
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Status</div>
            <span
              className={`inline-block mt-1 px-2 py-1 text-xs font-semibold rounded ${
                event.status === "published" ? "bg-green-100 text-green-800" : event.status === "draft" ? "bg-gray-100 text-gray-800" : "bg-red-100 text-red-800"
              }`}
            >
              {event.status}
            </span>
          </div>
        </div>
      </div>

      {/* Organizer Info */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Organizer</h2>
        <div className="space-y-2">
          <div>
            <div className="text-sm font-medium text-gray-500">Name</div>
            <div className="text-sm text-gray-900 mt-1">{event.organizer_name}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Email</div>
            <div className="text-sm text-gray-900 mt-1">{event.organizer_email}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
