import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/auth/LoginPage";
import ManagerDashboardPage from "./pages/manager/ManagerDashboardPage";
import ProductsPage from "./pages/manager/ProductsPage";
import BasketPage from "./pages/manager/BasketPage";
import OrderSuccessPage from "./pages/manager/OrderSuccessPage";
import OwnerDashboardPage from "./pages/owner/OwnerDashboardPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import OrdersPage from "./pages/orders/OrdersPage";
import OwnerLocationsPage from "./pages/owner/OwnerLocationsPage";
import OwnerSuppliersPage from "./pages/owner/OwnerSuppliersPage";
import OwnerOrdersPage from "./pages/owner/OwnerOrdersPage";
import PlatformDashboardPage from "./pages/platform/PlatformDashboardPage";
import PlatformCompaniesPage from "./pages/platform/PlatformCompaniesPage";
import CreateCompanyPage from "./pages/platform/CreateCompanyPage";
import OwnerUsersPage from "./pages/owner/OwnerUsersPage";
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/manager"
        element={
          <ProtectedRoute roles={["manager"]}>
            <ManagerDashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager/products"
        element={
          <ProtectedRoute roles={["manager"]}>
            <ProductsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager/basket"
        element={
          <ProtectedRoute roles={["manager"]}>
            <BasketPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager/order-success"
        element={
          <ProtectedRoute roles={["manager"]}>
            <OrderSuccessPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager/orders"
        element={
          <ProtectedRoute roles={["manager"]}>
            <OrdersPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/owner/dashboard"
        element={
          <ProtectedRoute roles={["owner"]}>
            <OwnerDashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/owner/locations"
        element={
          <ProtectedRoute roles={["owner"]}>
            <OwnerLocationsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/owner/suppliers"
        element={
          <ProtectedRoute roles={["owner"]}>
            <OwnerSuppliersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner/users"
        element={
          <ProtectedRoute roles={["owner"]}>
            <OwnerUsersPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/owner/orders"
        element={
          <ProtectedRoute roles={["owner"]}>
            <OwnerOrdersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/platform/dashboard"
        element={
          <ProtectedRoute roles={["platform_admin"]}>
            <PlatformDashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/platform/companies"
        element={
          <ProtectedRoute roles={["platform_admin"]}>
            <PlatformCompaniesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/platform/companies/new"
        element={
          <ProtectedRoute roles={["platform_admin"]}>
            <CreateCompanyPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
