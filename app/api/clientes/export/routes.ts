import { NextResponse } from "next/server"
import { ClienteDB } from "@/utils/db-services"

// GET - Exportar clientes a JSON
export async function GET() {
    try {
        const jsonData = await ClienteDB.exportToJSON()
        return new NextResponse(jsonData, {
            headers: {
                "Content-Type": "application/json",
                "Content-Disposition": `attachment; filename="clientes-export-${new Date().toISOString().split("T")[0]}.json"`,
            },
        })
    } catch (error) {
        console.error("Error al exportar clientes:", error)
        return NextResponse.json({ error: "Error al exportar clientes" }, { status: 500 })
    }
}
