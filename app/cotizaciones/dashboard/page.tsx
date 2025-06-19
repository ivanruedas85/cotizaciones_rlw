import { Dashboard } from "@/components/dashboard"

export default function DashboardPage() {
    return (
        <main className="min-h-screen p-4 md:p-8 lg:p-12 bg-gray-50">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2 text-gray-800">Dashboard</h1>
                    <p className="text-gray-600">Análisis completo de ventas y cotizaciones</p>
                </div>
                <Dashboard />
            </div>
        </main>
    )
}
