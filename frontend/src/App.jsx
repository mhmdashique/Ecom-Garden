import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SocialSidebar from "./components/SocialSidebar";
import Landing from "./pages/Landing";
import About from "./pages/About";
import Shop from "./pages/Shop";
import PlantDetail from "./pages/PlantDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import UserOrderDetail from "./pages/UserOrderDetail";
import { AdminLogin, AdminDashboard, AdminOrderView } from "./pages/Admin";
import { useAuth } from "./context/AuthContext";
import { ToastProvider } from "./components/Toast";
import { LanguageProvider } from "./context/LanguageContext";

function Protected({ children, admin }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (admin && !["admin", "super-admin"].includes(user.role))
    return <Navigate to="/" />;
  return children;
}

function Layout() {
  const loc = useLocation();
  const isAdminRoute = loc.pathname.startsWith("/admin");
  return (
    <>
      {!isAdminRoute && <Navbar />}
      {!isAdminRoute && <SocialSidebar />}
      <main
        className={isAdminRoute ? "min-h-screen bg-[#f6f7f4]" : "min-h-[70vh]"}
      >
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<About />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/plant/:id" element={<PlantDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <Protected>
                <Dashboard />
              </Protected>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <Protected>
                <UserOrderDetail />
              </Protected>
            }
          />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <Protected admin>
                <AdminDashboard />
              </Protected>
            }
          />
          <Route
            path="/admin/orders/:id"
            element={
              <Protected admin>
                <AdminOrderView />
              </Protected>
            }
          />
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <ToastProvider>
          <Layout />
        </ToastProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
