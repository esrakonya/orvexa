import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useState } from "react";

function AppLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    const handleMenuClick = () => {
        setIsSidebarOpen((current) => !current)
    }

    const handleNavigate = () => {
        setIsSidebarOpen(false)
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar 
                isOpen={isSidebarOpen}
                onNavigate={handleNavigate}
            />

            <div className="flex min-w-0 flex-1 flex-col">
                <main className="flex-1 p-6">
                    <Header onMenuClick={handleMenuClick} />
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default AppLayout