// Router.jsx
import { createBrowserRouter, Navigate } from "react-router-dom";

import Layout from "./Layout";
import ProtectedRoute from "./protectedRoute/Protected";

/* =======================
   PUBLIC PAGES
======================= */
import WeighMineLanding from "./components/UI-Components/LandingPage/bridge";
import Landing from "./pages/Landing";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Refund from "./pages/Refund";
import ForbiddenPage from "./pages/FallBackPages/403-Forbidden";
import ErrorFallback from "./pages/FallBackPages/ErrorFallback";
import NotFoundPage from "./pages/FallBackPages/404-pageNotFound";

import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";

/* =======================
   CORE PAGES
======================= */
import Dashboards from "./pages/Dashboards";
import Clients from "./pages/Clients/Clients";
import Items from "./pages/Items/Items";
import Invoices from "./pages/Invoices/Invoices";
import Purchases from "./pages/Purchases/Purchases";

/* =======================
   FORMS & SETTINGS
======================= */
import ClientForm from "./pages/Clients/ClientForm";
import ItemForm from "./pages/Items/ItemForm";
import InvoiceForm from "./pages/Invoices/InvoiceForm";
import PurchaseForm from "./pages/Purchases/PurchaseForm";

import Settings from "./pages/Settings";
import Subscribe from "./pages/Subscription";

/* =======================
   ROUTER
======================= */
const router = createBrowserRouter([
  /* ---------- PUBLIC ---------- */
  {
    path: "/",
    element: <ProtectedRoute publicOnly />,
    errorElement: <ErrorFallback />,
    children: [
      { index: true, element: <Landing /> },

      { path: "features", element: <Landing /> },
      { path: "pricing", element: <Landing /> },
      { path: "support", element: <Landing /> },
      { path: "contact", element: <Landing /> },
      { path: "about", element: <Landing /> },

      // { path: "bridge", element: <WeighMineLanding /> },

      // { path: "terms-conditions/policy", element: <Terms /> },
      { path: "terms", element: <Terms /> },
      { path: "privacy", element: <Privacy /> },
      { path: "refund", element: <Refund /> },
      { path: "signin", element: <SignIn /> },
      { path: "signup", element: <SignUp /> }
    ]
  },

  /* ---------- PROTECTED ---------- */
  {
    path: "/",
    element: <ProtectedRoute />,
    errorElement: <ErrorFallback />,
    children: [
      {
        element: <Layout />,
        children: [
          /* Redirect index → dashboard */
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: "dashboard", element: <Dashboards /> },

          { path: "clients", element: <Clients /> },
          { path: "clients/:id", element: <ClientForm /> },

          { path: "items", element: <Items /> },
          { path: "items/:id", element: <ItemForm /> },

          { path: "invoices", element: <Invoices /> },
          { path: "invoices/:id", element: <InvoiceForm /> },

          { path: "purchases", element: <Purchases /> },
          { path: "purchases/:id", element: <PurchaseForm /> },

          { path: "settings", element: <Settings /> },
          { path: "subscribe", element: <Subscribe /> },

          { path: "403", element: <ForbiddenPage /> },
          { path: "*", element: <NotFoundPage /> }
        ]
      }
    ]
  },

  /* ---------- GLOBAL 404 ---------- */
  {
    path: "*",
    element: <NotFoundPage />
  }
]);

export default router;
