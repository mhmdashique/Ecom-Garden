import React, { Suspense } from "react";
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
import { useAuth } from "./context/AuthContext";
import { ToastProvider } from "./components/Toast";
import { LanguageProvider } from "./context/LanguageContext";
import AIAssistant from "./components/AIAssistant";
import FeatureAIModal from "./components/FeatureAIModal";

const Landing = React.lazy(() => import("./pages/Landing"));
const About = React.lazy(() => import("./pages/About"));
const Shop = React.lazy(() => import("./pages/Shop"));
const Privacy = React.lazy(() => import("./pages/Privacy"));
const Terms = React.lazy(() => import("./pages/Terms"));
const FAQ = React.lazy(() => import("./pages/FAQ"));
const Refund = React.lazy(() => import("./pages/Refund"));
const PlantDetail = React.lazy(() => import("./pages/PlantDetail"));
const Cart = React.lazy(() => import("./pages/Cart"));
const Checkout = React.lazy(() => import("./pages/Checkout"));
const Contact = React.lazy(() => import("./pages/Contact"));
const Login = React.lazy(() => import("./pages/Login"));
const Register = React.lazy(() => import("./pages/Register"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const UserOrderDetail = React.lazy(() => import("./pages/UserOrderDetail"));
const AdminLogin = React.lazy(() =>
  import("./pages/Admin").then((m) => ({ default: m.AdminLogin }))
);
const AdminDashboard = React.lazy(() =>
  import("./pages/Admin").then((m) => ({ default: m.AdminDashboard }))
);
const AdminOrderView = React.lazy(() =>
  import("./pages/Admin").then((m) => ({ default: m.AdminOrderView }))
);
const AdminCustomerView = React.lazy(() =>
  import("./pages/Admin").then((m) => ({ default: m.AdminCustomerView }))
);

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
  const isDashboardRoute = loc.pathname.startsWith("/dashboard") || loc.pathname.startsWith("/orders");
  return (
    <>
      {!isAdminRoute && <Navbar />}
      {!isAdminRoute && !isDashboardRoute && <SocialSidebar />}
      <main
        className={isAdminRoute ? "min-h-screen bg-[#f6f7f4]" : isDashboardRoute ? "min-h-screen bg-[#fdfbf7]" : "min-h-[70vh]"}
      >
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[70vh]">
              <div className="w-8 h-8 border-2 border-gray-200 border-t-[#0a2e1f] rounded-full animate-spin"></div>
            </div>
          }
        >
          <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<About />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/plant/:id" element={<Protected><PlantDetail /></Protected>} />
          <Route path="/cart" element={<Protected><Cart /></Protected>} />
          <Route path="/checkout" element={<Protected><Checkout /></Protected>} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/refund" element={<Refund />} />
          <Route path="/returns" element={<Refund />} />
          <Route path="/return-policy" element={<Refund />} />
          <Route path="/faq" element={<FAQ />} />
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
          <Route
            path="/admin/customers/:id"
            element={
              <Protected admin>
                <AdminCustomerView />
              </Protected>
            }
          />
        </Routes>
      </Suspense>
      </main>
      {!isAdminRoute && !isDashboardRoute && <Footer />}
      {!isAdminRoute && !isDashboardRoute && <AIAssistant />}
      {!isAdminRoute && !isDashboardRoute && <FeatureAIModal />}
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
