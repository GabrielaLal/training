import React from "react"
import { Routes, Route, useNavigate } from "react-router-dom"
import ListView from "./list"

export default function Venues() {
  const navigate = useNavigate()

  return (
    <div className="p-8">
      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-8">
          <button onClick={() => navigate("/venues")} className="pb-3 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            List View
          </button>
        </div>
      </div>

      {/* Content */}
      <Routes>
        <Route index element={<ListView />} />
      </Routes>
    </div>
  )
}
