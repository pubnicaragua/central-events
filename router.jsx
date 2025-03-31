import { createBrowserRouter } from "react-router-dom"
import DashboardLayout from "./src/layouts/DashboardLayout"
import WelcomeLayout from "./src/layouts/WelcomeLayout"
import AuthLayout from "./src/layouts/AuthLayout"
import AdminLayout from "./src/layouts/AdminLayout"

import Login from "./src/views/Login"
import Register from "./src/views/Register"
import Welcome from "./src/views/Welcome"
import Events from "./src/views/Eventos"
import GettingStarted from "./src/views/GettingStarted"
import EventSettings from "./src/views/EventSettings"
import TicketsSettings from "./src/views/TicketsSettings"
import TicketLevels from "./src/views/TicketLevels"
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
import CapacityPage from "./src/views/CapacityPage"
import RegistrationListsPage from "./src/views/RegistrationListsPage"
import HomepageDesigner from "./src/views/HomepageDesigner"
import GuestPage from "./src/views/GuestPage"
import ProfilePage from "./src/views/ProfilePage"
import Amenidades from "./src/views/Amenities"

const router = createBrowserRouter([
  {
    path: "/",
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <Events />,
      },
      {
        path: 'admin/profile',
        element: <ProfilePage />,
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
        element: <EventSettings />,
      },
      {
        path: ":eventId/tickets",
        element: <TicketsSettings />,
      },
      {
        path: ":eventId/tickets/levels/:ticketId",
        element: <TicketLevels />,
      },
      {
        path: ":eventId/orders",
        element: <OrdersPage />,
      },
      {
        path: ":eventId/guests",
        element: <GuestPage />,
      },
      {
        path: ":eventId/questions",
        element: <QuestionsPage />,
      },
      {
        path: ":eventId/promo-codes",
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
        path: ":eventId/amenities",
        element: <Amenidades />,
      },
      {
        path: ":eventId/registration-lists",
        element: <RegistrationListsPage />,
      },
      {
        path: ":eventId/capacity",
        element: <CapacityPage />,
      },
      {
        path: ":eventId/page-designer",
        element: <HomepageDesigner />,
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

