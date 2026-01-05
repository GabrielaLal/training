import React from "react"

export default function OverviewTab({ venue }) {
  return (
    <div className="max-w-3xl">
      {/* Venue Details */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Venue Details</h2>
        <div className="space-y-4">
          <div>
            <div className="text-sm font-medium text-gray-500">Name</div>
            <div className="text-sm text-gray-900 mt-1">{venue.name}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Address</div>
            <div className="text-sm text-gray-900 mt-1">{venue.address || "Not specified"}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">City</div>
            <div className="text-sm text-gray-900 mt-1">{venue.city || "Not specified"}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Capacity</div>
            <div className="text-sm text-gray-900 mt-1">{venue.capacity > 0 ? `${venue.capacity} people` : "Unlimited"}</div>
          </div>
          {venue.amenities && venue.amenities.length > 0 && (
            <div>
              <div className="text-sm font-medium text-gray-500">Amenities</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {venue.amenities.map((amenity, idx) => (
                  <span key={idx} className="px-3 py-1 text-sm bg-indigo-100 text-indigo-800 rounded">
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

