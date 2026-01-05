import React from "react"
import { HiLockClosed } from "react-icons/hi"

export default function MyRegistrations() {
  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
            <HiLockClosed className="w-10 h-10 text-gray-400" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">Week 2+ Feature</h1>

          <div className="text-left bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="text-sm font-semibold text-blue-900 mb-3">📚 Why is this locked?</h3>
            <div className="text-sm text-blue-800 space-y-2">
              <p>
                <strong>Week 1 Focus:</strong> Understanding the Event module (CRUD, search patterns, organizer flow)
              </p>
              <p>
                <strong>Week 2+:</strong> You'll build the Attendee/Registration system:
              </p>
              <ul className="list-disc ml-5 mt-2 space-y-1">
                <li>
                  Study the existing <code className="bg-blue-100 px-1 rounded">Attendee</code> model and controller
                </li>
                <li>Add a "Register" button to event pages</li>
                <li>Build this "My Registrations" view</li>
                <li>Handle capacity checks, ticket generation, and payment flows</li>
              </ul>
            </div>
          </div>

          <div className="text-gray-600">
            <p className="mb-4">
              For now, focus on mastering the <strong>Event module</strong> and understanding how organizers create and manage events.
            </p>
            <p className="text-sm">The registration system will unlock in Week 2, where you'll implement the full attendee experience.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
