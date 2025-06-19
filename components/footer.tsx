import {SITE_LARGE_TITLE} from "@/utils/const.ts"
export function Footer() {
    return (
        <footer className="border-t bg-background">
            <div className="max-w-6x1 mx-auto px-4 py-6">
                <div className="text-center text-sm text-muted-foreground">
                    &copy; {new Date().getFullYear().toPrecision()} {SITE_LARGE_TITLE}. Todos los derechos reservados.
                </div>
            </div>
        </footer>
    )
}