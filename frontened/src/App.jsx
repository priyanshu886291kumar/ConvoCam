

// import {Routes,Route,Navigate} from 'react-router';
// import { HomePage } from './pages/HomePage';
// import  SignUpPage  from './pages/SignUpPage';
// import { LoginPage } from './pages/LoginPage';
// import { OnboardingPage } from './pages/OnboardingPage';
// import { NotificationPage } from './pages/NotificationPage';
// import { CallPage } from './pages/CallPage';
// import { ChatPage } from './pages/ChatPage';
// // import { LogoutPage } from './pages/LogoutPage';
// import toast, { Toaster } from 'react-hot-toast';
// import {useQuery}  from '@tanstack/react-query';
// import { axiosInstance } from './lib/axios.js';

// const App=()  => {

//   //tanstack query way of fetching data
//   const {data:authData,isLoading,error} = useQuery({
//     queryKey:["authUser"], // must be an array
//     queryFn: async ()=> {
//      const res= await axiosInstance.get("/auth/me");
//      return res.data;
//     },
//     retry:false, // to not retry on error
//   });

// const authUser = authData?.user; // optional chaining to avoid error if authData is undefined

//   // console.log({data});
//   // console.log({isLoading});
//   // console.log({error});


//    return(
//     <div className="h-screen text-5xl" data-theme="night">
      
//       <button onClick ={() => toast.success('This is a success message!')}>Hello world</button>
// <Routes>
//    <Route path="/" element={authUser ?<HomePage /> :<Navigate to="/login"/>} />
//    <Route path="/signup" element={!authUser ? <SignUpPage /> :<Navigate to="/"/>} />
//    <Route path="/login" element={!authUser ? <LoginPage /> :<Navigate to="/"/>} />
//    <Route path="/onboarding" element={authUser ?<OnboardingPage /> :<Navigate to="/login"/>} />
//    <Route path="/notification" element={authUser ?<NotificationPage />: <Navigate to="/login"/>} />
//    <Route path="/call" element={authUser ?<CallPage /> : <Navigate to="/login"/>} />
//    <Route path="/chat" element={authUser ?<ChatPage /> : <Navigate to="/login"/>} />
//    {/* <Route path="/logout" element={<LogoutPage />} /> */}
// </Routes>

//   <Toaster/>
  
//    </div>
//    );
// };

// export default App;















import { Navigate, Route, Routes } from "react-router";
// import CallPage from "./pages/CallPage";

import HomePage from "./pages/HomePage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import NotificationPage from "./pages/NotificationPage.jsx";
import CallPage from "./pages/CallPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import OnboardingPage from "./pages/OnboardingPage.jsx";

import { Toaster } from "react-hot-toast";

import PageLoader from "./components/PageLoader.jsx";
import useAuthUser from "./hooks/useAuthUser.js";
import Layout from "./components/Layout.jsx";
import { useThemeStore } from "./store/useThemeStore.js";

const App = () => {
  const { isLoading, authUser } = useAuthUser();
  const { theme } = useThemeStore();

  const isAuthenticated = Boolean(authUser);
  const isOnboarded = authUser?.isOnboarded;

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

        {/* <Route path="/call/:userId" element={<CallPage />} /> */}

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
      </Routes>

      <Toaster />
    </div>
  );
};
export default App;