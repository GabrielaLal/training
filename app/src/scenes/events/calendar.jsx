import React from "react"
import { AiOutlineCalendar } from "react-icons/ai"

export default function CalendarView() {
  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Calendar View</h1>
        <p className="text-sm text-gray-600">Visual calendar display of events</p>
      </div>

      {/* Week 2 Notice */}
      <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-6 mb-6">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-amber-900 mb-2">Week 2 Feature</h3>
            <p className="text-sm text-amber-800">Calendar view will be implemented in Week 2. Focus on the List View and Event Detail pages for Week 1.</p>
          </div>
        </div>
      </div>

      {/* Empty State */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
        <AiOutlineCalendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Coming in Week 2</h3>
        <p className="text-sm text-gray-600">This view will be built during Week 2 training</p>
      </div>
    </div>
  )
}
