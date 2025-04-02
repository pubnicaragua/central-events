import { createBrowserRouter } from "react-router-dom"
import DashboardLayout from "./src/layouts/DashboardLayout"
import AuthLayout from "./src/layouts/AuthLayout"
import AdminLayout from "./src/layouts/AdminLayout"

import Login from "./src/views/Login"
import Register from "./src/views/Register"
import Events from "./src/views/Eventos"
import GettingStarted from "./src/views/GettingStarted"
import EventSettings from "./src/views/EventSettings"
import TicketsSettings from "./src/views/TicketsSettings"
import TicketLevels from "./src/views/TicketLevels"
import QuestionsPage from "./src/views/QuestionsPage"
import PromoCodes from "./src/views/PromoCodes"
import DashboardPage from "./src/views/dashboard/page"
import Home from "./src/views/Home"
import EventDetail from "./src/views/EventDetail"
import Checkout from "./src/views/Checkout"
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
import CheckInPage from "./src/views/CheckInPage"
import AmenitiesPage from "./src/views/AmenittiesPage"
import ConfirmationPage from "./src/views/ConfirmationPage"
import RifasPage from "./src/views/Rifas"
import EventAttendee from "./src/views/EventAttendee"
import AttendeeDetail from "./src/views/AttendeeDetail"
import UsersPage from "./src/views/UsersPage"
import RolesPage from "./src/views/RolesPage"

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
        path: "admin/profile",
        element: <ProfilePage />,
      },
      // Rutas públicas
      {
        path: "event/:eventId",
        element: <EventDetail />,
      },
      {
        path: "checkout/:eventId/:ticketId",
        element: <Checkout />,
      },
      {
        path: "amenities/:eventId/:ticketId",
        element: <AmenitiesPage />,
      },
      {
        path: "confirm/:eventId/:ticketId",
        element: <ConfirmationPage />,
      },
      {
        path: "order-confirmation/:orderId",
        element: <OrderConfirmation />,
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
      {
        path: ":eventId/check-in",
        element: <CheckInPage />,
      },
      {
        path: ":eventId/raffles",
        element: <RifasPage />,
      },
      {
        path: ":eventId/users",
        element: <UsersPage />,
      },
      {
        path: ":eventId/roles",
        element: <RolesPage />,
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
  // Nuevas rutas para la página de evento público y detalle de asistente
  {
    path: "/events/:eventId",
    element: <EventAttendee />,
  },
  {
    path: "/events/:eventId/attendee/:attendeeId",
    element: <AttendeeDetail />,
  },
])

export default router

