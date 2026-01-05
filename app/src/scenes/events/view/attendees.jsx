import React from "react"
import { HiLockClosed } from "react-icons/hi"

export default function AttendeesTab({ eventId }) {
  return (
    <div>
      {/* Week 2 Lock Message */}
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 mb-6">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <HiLockClosed className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-yellow-900 mb-2">🔒 Week 2+ Feature</h3>
            <div className="text-sm text-yellow-800 space-y-2">
              <p>
                <strong>What you'll build:</strong>
              </p>
              <ul className="list-disc ml-5 space-y-1">
                <li>
                  Fetch attendees: <code className="bg-yellow-100 px-1 rounded">POST /attendee/search</code> with event_id filter
                </li>
                <li>Display table: Name, Email, Ticket Number, Registration Date, Status</li>
                <li>Show status badges (pending/confirmed/cancelled/checked-in)</li>
                <li>Add check-in functionality for organizers</li>
                <li>Export attendee list (CSV)</li>
              </ul>
              <p className="mt-3">
                <strong>Week 1 Focus:</strong> Master the Event CRUD patterns first!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Empty State */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Attendee Management Coming Soon</h3>
        <p className="text-sm text-gray-600">This feature will be unlocked in Week 2</p>
      </div>
    </div>
  )
}
