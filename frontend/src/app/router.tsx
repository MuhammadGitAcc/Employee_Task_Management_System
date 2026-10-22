import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import AppLayout from "~/components/layout/AppLayout";
import LoginPage from "~/features/auth/LoginPage";
import ProtectedRoute from "~/features/auth/ProtectedRoute";
import NotFound from "./NotFound";
import RouteError from "./RouteError";

const Dashboard = lazy(() => import("~/features/dashboard/Dashboard"));
const Tasks = lazy(() => import("~/features/tasks/Tasks"));
const Employees = lazy(() => import("~/features/employees/Employees"));
const Chat = lazy(() => import("~/features/chat/Chat"));
const Profile = lazy(() => import("~/features/profile/Profile"));

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage />, errorElement: <RouteError /> },
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    errorElement: <RouteError />,
    children: [
      {
        errorElement: <RouteError />,
        children: [
          { path: "/", element: <Tasks /> },
          { path: "/dashboard", element: <Dashboard /> },
          { path: "/tasks", element: <Tasks /> },
          { path: "/employees", element: <Employees /> },
          { path: "/chat", element: <Chat /> },
          { path: "/profile", element: <Profile /> },
          { path: "*", element: <NotFound /> },
        ],
      },
    ],
  },
]);
