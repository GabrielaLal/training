import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { AiOutlineHome, AiOutlineCalendar, AiOutlinePlus, AiOutlineUser } from "react-icons/ai"
import { HiOutlineTicket } from "react-icons/hi"
import { MdOutlineLocationOn } from "react-icons/md"

const MENU = [
  { title: "Mastering the API", to: "/dashboard", logo: <AiOutlineHome className="h-5 w-5" /> },
  { title: "Discover Events", to: "/", logo: <AiOutlineCalendar className="h-5 w-5" /> },
  { title: "My Events", to: "/my-events", logo: <AiOutlineCalendar className="h-5 w-5" /> },
  { title: "My Venues", to: "/my-venues", logo: <MdOutlineLocationOn className="h-5 w-5" /> },
  { title: "My Registrations", to: "/my-registrations", logo: <HiOutlineTicket className="h-5 w-5" /> }
]

const Navbar = () => {
  const [selected, setSelected] = useState(0)

  useEffect(() => {
    const index = MENU.findIndex(e => location.pathname.includes(e.to))
    setSelected(index)
  }, [location])

  return (
    <div className="h-screen bg-white border-r border-gray-200">
      <div className="flex flex-col h-full p-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-gray-900 rounded flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">EventHub</h2>
          </div>
          <p className="text-gray-500 text-xs ml-10">Training Platform</p>
        </div>

        {/* Menu */}
        <nav className="flex-1">
          {MENU.map((menu, index) => (
            <Link
              to={menu.to}
              key={menu.title}
              className={`w-full mb-2 px-3 py-2.5 rounded flex items-center justify-between group transition-all ${
                selected === index ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
              onClick={() => setSelected(index)}
            >
              <div className="flex items-center gap-3">
                {menu.logo}
                <span className="text-sm font-medium">{menu.title}</span>
              </div>
              {menu.badge && (
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${selected === index ? "bg-white/20 text-white" : "bg-gray-200 text-gray-600"}`}>{menu.badge}</span>
              )}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Training Mode</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Navbar
