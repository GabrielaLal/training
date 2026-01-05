import React from "react"

export default function RawView({ event }) {
  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Raw API Response</h1>
        <p className="text-sm text-gray-600">
          Direct JSON response from <code className="bg-gray-100 px-2 py-0.5 rounded font-mono">GET /event/:id</code>
        </p>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-blue-900 mb-1">📚 Understanding API Responses</h3>
            <p className="text-sm text-blue-800">This shows the raw JSON returned by the backend. Notice the structure of the event object as it's stored in MongoDB.</p>
          </div>
        </div>
      </div>

      {/* Raw JSON */}
      <div className="bg-gray-900 rounded-lg p-6 overflow-auto">
        <pre className="text-sm text-green-400 font-mono">{JSON.stringify(event, null, 2)}</pre>
      </div>
    </div>
  )
}
