import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const Layout = ({ children, showSidebar = false }) => {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="flex flex-1 h-full overflow-hidden">
        {showSidebar && <Sidebar />}

        <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
          <Navbar />

          <main className="flex-1 flex flex-col overflow-hidden min-h-0 bg-base-100">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
export default Layout;