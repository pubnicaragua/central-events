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
import TicketPage from "./src/views/TicketPage"
import AttendePage from "./src/views/AttendeesPage"
import OrdersPage from "./src/views/OrdersPage"
import QuestionsPage from "./src/views/QuestionsPage"

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
      {
        path: "attendees",
        element: <AttendePage />,
      },
      {
        path: "tickets",
        element: <TicketPage />,
      },
      {
        path: "orders",
        element: <OrdersPage />,
      },
      {
        path: "questions",
        element: <QuestionsPage />,
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

