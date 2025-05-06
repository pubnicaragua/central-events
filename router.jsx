import { createBrowserRouter } from "react-router-dom"
import DashboardLayout from "./src/layouts/DashboardLayout"
import AuthLayout from "./src/layouts/AuthLayout"
import AdminLayout from "./src/layouts/AdminLayout"
import ProtectedRoute from "./src/components/ProtectedRoute"
import Layout from "./src/layouts/Layout"

import Login from "./src/views/Login"
import Register from "./src/views/Register"
import Events from "./src/views/Eventos"
import GettingStarted from "./src/views/GettingStarted"
import EventSettings from "./src/views/EventSettings"
import TicketsSettings from "./src/views/TicketsSettings"
import TicketLevels from "./src/views/TicketLevels"
import QuestionsPage from "./src/views/QuestionsPage"
import PromoCodes from "./src/views/PromoCodes"
import DashboardPage from "./src/views/DashboardPage"
import AttendeesPage from "./src/views/Attendants"
import OrdersPage from "./src/views/OrdersPage"
import Messages from "./src/views/Messages"
import CapacityPage from "./src/views/CapacityPage"
import RegistrationListsPage from "./src/views/RegistrationListsPage"
import HomepageDesigner from "./src/views/HomepageDesigner"
import ProfilePage from "./src/views/ProfilePage"
import Amenidades from "./src/views/Amenities"
import CheckInPage from "./src/views/CheckInPage"
import RifasPage from "./src/views/Rifas"
import EventAttendee from "./src/views/EventAttendee"
import AttendeeDetail from "./src/views/AttendeeDetail"
import UsersPage from "./src/views/UsersPage"
import RolesPage from "./src/views/RolesPage"
//import Notifications from "./src/views/Notifications"
import AccessDenied from "./src/views/AccessDenied"
import ForgotPassword from "./src/views/ForgotPassword"
import ResetPassword from "./src/views/ResetPassword"
import Employees from "./src/views/EventEmployeesPage"
import ModulesPage from "./src/views/ModulesPage"
import TrainingPage from "./src/views/TrainingPage"

// Definición de permisos por rol
// 1: Admin, 2: Organizador, 3: Asistente, 4: Empleado
const ROLE_PERMISSIONS = {
  // Rutas de administración
  adminEvents: [1, 2, 4],
  adminProfile: [1, 2, 4],
  adminUsers: [1],
  adminRoles: [1],
  adminModules: [1],
  adminTraining: [1, 2, 4],
  //adminNotifications: [1],

  // Rutas de gestión de eventos
  eventAmenities: [1, 2],
  eventAttendees: [1, 2],
  eventCapacity: [1],
  eventCheckIn: [1, 4],
  eventEmployeeCheckIn: [1, 4],
  eventDashboard: [1, 2, 4],
  EventEmployees: [1, 4],
  eventGettingStarted: [1],
  eventMessages: [1],
  eventGuests: [1, 2],
  eventOrders: [1], // Solo admin puede ver pedidos
  eventPageDesigner: [1],
  eventPromoCodes: [1],
  eventQuestions: [1],
  eventRaffles: [1, 2],
  eventRegistrationLists: [1],
  eventSettings: [1, 2],
  eventTickets: [1, 2],
  eventTicketLevels: [1, 2],
}

const router = createBrowserRouter([
  // Rutas públicas

  {
    path: "reset-password",
    element: <ResetPassword />,
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
      {
        path: "forgot-password",
        element: <ForgotPassword />,
      },
    ],
  },

  // Rutas públicas para eventos
  {
    path: "/events/:eventId",
    element: <EventAttendee />,
  },
  {
    path: "/events/:eventId/attendee/:attendeeId",
    element: <AttendeeDetail />,
  },
  // Página de acceso denegado
  {
    path: "/access-denied",
    element: <AccessDenied />,
  },

  //Ruta protegida para el empleado de check-ins
  {
    path: "/manage/event",
    element: <ProtectedRoute allowedRoles={ROLE_PERMISSIONS.eventEmployeeCheckIn} />,
    children: [
      {
        path: "",
        element: <Layout />,
        children: [
          {
            path: ":eventId/checkin",
            element: <CheckInPage />
          },
        ]
      }
    ]
  },
  // Ruta protegida para usuario de check in
  {
    path: "/user",
    element: <ProtectedRoute allowedRoles={ROLE_PERMISSIONS.adminProfile} />,
    children: [
      {
        path: "",
        element: <Layout />,
        children: [
          {
            path: "profile",
            element: <ProfilePage />
          },
        ]
      }
    ]
  },
  // Rutas protegidas para administradores
  {
    path: "/",
    element: <ProtectedRoute allowedRoles={ROLE_PERMISSIONS.adminEvents} />,
    children: [
      {
        path: "/",
        element: <AdminLayout />,
        children: [
          {
            path: "admin/events",
            element: <Events />,
          },
          {
            path: "admin/profile",
            element: <ProtectedRoute allowedRoles={ROLE_PERMISSIONS.adminProfile} />,
            children: [
              {
                path: "",
                element: <ProfilePage />,
              },
            ],
          },
          {
            path: "admin/users",
            element: <ProtectedRoute allowedRoles={ROLE_PERMISSIONS.adminUsers} />,
            children: [
              {
                path: "",
                element: <UsersPage />,
              },
            ],
          },
          {
            path: "admin/roles",
            element: <ProtectedRoute allowedRoles={ROLE_PERMISSIONS.adminRoles} />,
            children: [
              {
                path: "",
                element: <RolesPage />,
              },
            ],
          },
          {
            path: "admin/modules",
            element: <ProtectedRoute allowedRoles={ROLE_PERMISSIONS.adminModules} />,
            children: [
              {
                path: "",
                element: <ModulesPage />,
              },
            ],
          },
          {
            path: "admin/training",
            element: <ProtectedRoute allowedRoles={ROLE_PERMISSIONS.adminTraining} />,
            children: [
              {
                path: "",
                element: <TrainingPage />,
              },
            ],
          },
        ],
      },
    ],
  },
  // Rutas protegidas para gestión de eventos
  {
    path: "/manage/event",
    element: <ProtectedRoute />, // Cualquier usuario autenticado
    children: [
      {
        path: "",
        element: <DashboardLayout />,
        children: [
          {
            path: ":eventId/getting-started",
            element: <ProtectedRoute allowedRoles={ROLE_PERMISSIONS.eventGettingStarted} />,
            children: [
              {
                path: "",
                element: <GettingStarted />,
              },
            ],
          },
          {
            path: ":eventId/settings",
            element: <ProtectedRoute allowedRoles={ROLE_PERMISSIONS.eventSettings} />,
            children: [
              {
                path: "",
                element: <EventSettings />,
              },
            ],
          },
          {
            path: ":eventId/tickets",
            element: <ProtectedRoute allowedRoles={ROLE_PERMISSIONS.eventTickets} />,
            children: [
              {
                path: "",
                element: <TicketsSettings />,
              },
            ],
          },
          {
            path: ":eventId/tickets/levels/:ticketId",
            element: <ProtectedRoute allowedRoles={ROLE_PERMISSIONS.eventTicketLevels} />,
            children: [
              {
                path: "",
                element: <TicketLevels />,
              },
            ],
          },
          {
            path: ":eventId/orders",
            element: <ProtectedRoute allowedRoles={ROLE_PERMISSIONS.eventOrders} />,
            children: [
              {
                path: "",
                element: <OrdersPage />,
              },
            ],
          },
          {
            path: ":eventId/questions",
            element: <ProtectedRoute allowedRoles={ROLE_PERMISSIONS.eventQuestions} />,
            children: [
              {
                path: "",
                element: <QuestionsPage />,
              },
            ],
          },
          {
            path: ":eventId/promo-codes",
            element: <ProtectedRoute allowedRoles={ROLE_PERMISSIONS.eventPromoCodes} />,
            children: [
              {
                path: "",
                element: <PromoCodes />,
              },
            ],
          },
          {
            path: ":eventId/dashboard",
            element: <ProtectedRoute allowedRoles={ROLE_PERMISSIONS.eventDashboard} />,
            children: [
              {
                path: "",
                element: <DashboardPage />,
              },
            ],
          },
          {
            path: ":eventId/amenities",
            element: <ProtectedRoute allowedRoles={ROLE_PERMISSIONS.eventAmenities} />,
            children: [
              {
                path: "",
                element: <Amenidades />,
              },
            ],
          },
          {
            path: ":eventId/employees",
            element: <ProtectedRoute allowedRoles={ROLE_PERMISSIONS.eventEmployees} />,
            children: [
              {
                path: "",
                element: <Employees />,
              },
            ],
          },
          {
            path: ":eventId/registration-lists",
            element: <ProtectedRoute allowedRoles={ROLE_PERMISSIONS.eventRegistrationLists} />,
            children: [
              {
                path: "",
                element: <RegistrationListsPage />,
              },
            ],
          },
          {
            path: ":eventId/capacity",
            element: <ProtectedRoute allowedRoles={ROLE_PERMISSIONS.eventCapacity} />,
            children: [
              {
                path: "",
                element: <CapacityPage />,
              },
            ],
          },
          {
            path: ":eventId/page-designer",
            element: <ProtectedRoute allowedRoles={ROLE_PERMISSIONS.eventPageDesigner} />,
            children: [
              {
                path: "",
                element: <HomepageDesigner />,
              },
            ],
          },
          {
            path: ":eventId/messages",
            element: <ProtectedRoute allowedRoles={ROLE_PERMISSIONS.eventMessages} />,
            children: [
              {
                path: "",
                element: <Messages />,
              },
            ],
          },
          {
            path: ":eventId/attendees",
            element: <ProtectedRoute allowedRoles={ROLE_PERMISSIONS.eventAttendees} />,
            children: [
              {
                path: "",
                element: <AttendeesPage />,
              },
            ],
          },
          {
            path: ":eventId/check-in",
            element: <ProtectedRoute allowedRoles={ROLE_PERMISSIONS.eventCheckIn} />,
            children: [
              {
                path: "",
                element: <CheckInPage />,
              },
            ],
          },
          {
            path: ":eventId/raffles",
            element: <ProtectedRoute allowedRoles={ROLE_PERMISSIONS.eventRaffles} />,
            children: [
              {
                path: "",
                element: <RifasPage />,
              },
            ],
          },
        ],
      },
    ],
  },

])

export default router

