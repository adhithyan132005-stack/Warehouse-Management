import Sidebar from "./sidebar";

export default function Layout({ children, role }) {
    return (
        <div className="layout-container" style={{ display: 'flex', flex: 1 }}>
            <Sidebar role={role} />
            <main className="main-content" style={{ flex: 1, padding: '24px' }}>
                {children}
            </main>
        </div>
    )
}
