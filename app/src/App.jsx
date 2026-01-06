import { useEffect, useState } from "react"
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import * as Sentry from "@sentry/browser"

import Auth from "@/scenes/auth"
import Dashboard from "@/scenes/dashboard"
import Events from "@/scenes/events"
import Venues from "@/scenes/venues"
import Account from "@/scenes/account"
import EventView from "@/scenes/events/view"
import VenueView from "@/scenes/venues/view"
import MyEvents from "@/scenes/my-events"
import MyVenues from "@/scenes/my-venues"
import MyRegistrations from "@/scenes/my-registrations"

import Navbar from "@/components/NavBar"
import TopBar from "@/components/TopBar"
import Loader from "@/components/loader"

import useStore from "@/services/store"
import api from "@/services/api"

import { environment, SENTRY_URL } from "./config"

if (environment === "production") {
  Sentry.init({ dsn: SENTRY_URL, environment: "app" })
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/auth/*" element={<Auth />} />
        </Route>
        <Route element={<UserLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/*" element={<Events />} />
          <Route path="/event/:id/*" element={<EventView />} />
          <Route path="/venues/*" element={<Venues />} />
          <Route path="/venue/:id/*" element={<VenueView />} />
          <Route path="/my-events" element={<MyEvents />} />
          <Route path="/my-venues" element={<MyVenues />} />
          <Route path="/my-registrations" element={<MyRegistrations />} />
          <Route path="/account" element={<Account />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Toaster position="top-center" />
    </BrowserRouter>
  )
}

const AuthLayout = () => {
  const { user } = useStore()
  if (user) return <Navigate to="/" replace={true} />
  return <Outlet />
}

const UserLayout = () => {
  const [loading, setLoading] = useState(true)
  const { user, setUser } = useStore()

  async function fetchUser() {
    try {
      const { ok, token, user } = await api.get("/user/signin_token")
      if (!ok) {
        setUser(null)
        return
      }
      api.setToken(token)
      setUser(user)
    } catch (e) {
      console.log(e)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  if (loading) return <Loader />

  if (!user) return <Navigate to="/auth" replace={true} />

  return (
    <div className="flex flex-col h-screen overflow-hidden lg:flex-row">
      <nav className="w-56 absolute left-0 top-0">
        <Navbar />
      </nav>
      <main className="ml-56 h-full w-full overflow-auto bg-gray-50">
        <div className="h-14 border-b border-secondary bg-white">
          <TopBar />
        </div>
        <Outlet />
      </main>
    </div>
  )
}
