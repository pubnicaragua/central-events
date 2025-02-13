import { Outlet } from "react-router-dom";
import { WavesIcon as Wave } from "lucide-react";

export default function WelcomeLayout() {
    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-gray-700 p-4">
                <div className="container mx-auto flex items-center">
                    <h1 className="text-2xl font-bold text-white">hi events</h1>
                    <span className="ml-auto text-pink-400">BG</span>
                </div>
            </header>
            
            <main className="container mx-auto px-4 py-8">
                <div className="mb-12">
                    <h2 className="text-3xl font-bold text-purple-800">
                        Bienvenido a Hola.Eventos, Benjamin <Wave className="inline-block h-8 w-8 text-yellow-400" />
                    </h2>
                </div>
                
                <Outlet />
            </main>
        </div>
    );
}
