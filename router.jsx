import { createBrowserRouter } from "react-router-dom"
import DashboardLayout from "./src/layouts/DashboardLayout"
import WelcomeLayout from "./src/layouts/WelcomeLayout"
import AuthLayout from "./src/layouts/AuthLayout"

import Login from "./src/views/Login"
import Register from "./src/views/Register"
import Welcome from "./src/views/Welcome"
import Events from "./src/views/Events"
import GettingStarted from "./src/views/GettingStarted"
import EventConfig from "./src/views/EventConfig"

const router = createBrowserRouter([
  {
    path: "/",
    element: <WelcomeLayout />,
    children: [
      {
        index: true,
        element: <Events />,
      },
    ],
  },
  {
    path: "/welcome",
    element: <WelcomeLayout />,
    children: [
      {
        index: true,
        element: <Welcome />,
      },
    ],
  },
  {
    path: "/manage/event",
    element: <DashboardLayout />,
    children: [
      {
        path: ":eventId/getting-started",
        element: <GettingStarted />,
      },
      {
        path: ":eventId/settings",
        element: <EventConfig />,
      },
    ],
  },
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
    ],
  },
])

export default router

