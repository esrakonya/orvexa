import { Outlet } from "react-router-dom";

function AppLayout() {
    return (
        <div>
            <header>
                Orvexa
            </header>

            <main>
                <Outlet />
            </main>
        </div>
    )
}

export default AppLayout