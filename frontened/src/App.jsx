import { useState, useEffect } from "react";
import { Navigate, Route, Routes, useNavigate, useLocation } from "react-router";
import HomePage from "./pages/HomePage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import NotificationPage from "./pages/NotificationPage.jsx";
import CallPage from "./pages/CallPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import OnboardingPage from "./pages/OnboardingPage.jsx";
import FriendsPage from "./pages/FriendsPage";
import { Toaster } from "react-hot-toast";
import PageLoader from "./components/PageLoader.jsx";
import useAuthUser from "./hooks/useAuthUser.js";
import Layout from "./components/Layout.jsx";
import IncomingCallModal from "./components/IncomingCallModal.jsx";
import { useThemeStore } from "./store/useThemeStore.js";
import { useSocket } from "./hooks/useSocket";
import { axiosInstance } from "./lib/axios";

const App = () => {
  const { isLoading, authUser } = useAuthUser();
  const { theme } = useThemeStore();
  const isAuthenticated = Boolean(authUser);
  const isOnboarded = authUser?.isOnboarded;
  const socket = useSocket(authUser?._id);
  const navigate = useNavigate();
  const location = useLocation();

  const [incomingCall, setIncomingCall] = useState(null); // { from: userId, callerInfo: {} }

  // Listen for incoming call requests
  useEffect(() => {
    if (!socket) return;

    const handleIncomingCall = async ({ from }) => {
      // Don't show incoming call modal if user is already on a call page or calling
      if (window.location.pathname.startsWith("/call")) return;

      try {
        const res = await axiosInstance.get(`/users/${from}`);
        setIncomingCall({ from, callerInfo: res.data });
      } catch {
        setIncomingCall({ from, callerInfo: { fullName: "User", _id: from } });
      }
    };

    const handleCallEnded = () => {
      setIncomingCall(null);
    };

    socket.on("incoming-call", handleIncomingCall);
    socket.on("call-ended", handleCallEnded);

    return () => {
      socket.off("incoming-call", handleIncomingCall);
      socket.off("call-ended", handleCallEnded);
    };
  }, [socket]);

  const handleAcceptCall = () => {
    if (incomingCall?.from) {
      const fromId = incomingCall.from;
      setIncomingCall(null);
      navigate(`/call/${fromId}`, { state: { isCaller: false } });
    }
  };

  const handleDeclineCall = () => {
    if (socket && incomingCall?.from) {
      const roomId = [authUser?._id, incomingCall.from].sort().join("_");
      socket.emit("end-call", { roomId, to: incomingCall.from });
    }
    setIncomingCall(null);
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="h-screen" data-theme={theme}>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated && isOnboarded ? (
              <Layout showSidebar={true}>
                <HomePage />
              </Layout>
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }
        />
        <Route
          path="/signup"
          element={
            !isAuthenticated ? <SignUpPage /> : <Navigate to={isOnboarded ? "/" : "/onboarding"} />
          }
        />
        <Route
          path="/login"
          element={
            !isAuthenticated ? <LoginPage /> : <Navigate to={isOnboarded ? "/" : "/onboarding"} />
          }
        />
        <Route
          path="/notifications"
          element={
            isAuthenticated && isOnboarded ? (
              <Layout showSidebar={true}>
                <NotificationPage />
              </Layout>
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }
        />
        <Route
          path="/call/:userId"
          element={
            isAuthenticated && isOnboarded ? (
              <CallPage />
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }
        />
        <Route
          path="/chat/:id"
          element={
            isAuthenticated && isOnboarded ? (
              <Layout showSidebar={false}>
                <ChatPage />
              </Layout>
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }
        />
        <Route
          path="/onboarding"
          element={
            isAuthenticated ? (
              !isOnboarded ? (
                <OnboardingPage />
              ) : (
                <Navigate to="/" />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/friends"
          element={
            isAuthenticated && isOnboarded ? (
              <Layout showSidebar={true}>
                <FriendsPage />
              </Layout>
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }
        />
      </Routes>

      {/* Incoming Call Popup Modal */}
      {incomingCall && (
        <IncomingCallModal
          caller={incomingCall.callerInfo}
          onAccept={handleAcceptCall}
          onDecline={handleDeclineCall}
        />
      )}

      <Toaster />
    </div>
  );
};

export default App;