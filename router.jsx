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
import QuestionsPage from "./src/views/QuestionsPage"
import PromoCodes from "./src/views/PromoCodes"
import DashboardPage from "./src/views/dashboard/page"
import Home from "./src/views/Home"
import EventDetail from "./src/views/EventDetail" // Nueva importación
import Checkout from "./src/views/Checkout" // Nueva importación
import OrderConfirmation from "./src/views/OrderConfirmation"
import AttendeesPage from "./src/views/Attendants"
import OrdersPage from "./src/views/OrdersPage"
import Messages from "./src/views/Messages"

const router = createBrowserRouter([
  {
    path: "/",
    element: <WelcomeLayout />,
    children: [
      {
        index: true,
        element: <Events />,
      },
      // Añadimos las nuevas rutas aquí para que usen WelcomeLayout
      {
        path: "event/:eventId",
        element: <EventDetail />,
      },
      {
        path: "checkout/:eventId/:ticketId",
        element: <Checkout />,
      },
      {
        path: "order-confirmation/:orderId",
        element: <OrderConfirmation />,
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
        path: ":eventId/tickets",
        element: <TicketPage />,
      },
      {
        path: ":eventId/orders",
        element: <OrdersPage />,
      },
      {
        path: "questions",
        element: <QuestionsPage />,
      },
      {
        path: "promo-codes",
        element: <PromoCodes />,
      },
      {
        path: ":eventId/dashboard",
        element: <DashboardPage />,
      },
      {
        path: "widget",
        element: <Home />,
      },
      {
        path: "registration-lists",
        element: <Home />,
      },
      {
        path: "capacity",
        element: <Home />,
      },
      {
        path: "page-designer",
        element: <Home />,
      },
      {
        path: ":eventId/messages",
        element: <Messages />,
      },
      {
        path: ":eventId/attendees",
        element: <AttendeesPage />,
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

