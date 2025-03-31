import { Outlet } from "react-router-dom";
//import { WavesIcon as Wave } from "lucide-react";
import { Toaster } from 'sonner'

export default function WelcomeLayout() {
    return (

        <div className="min-h-screen bg-gray-50">
            <Toaster position="top-right" />
            
            <header className="bg-gray-700 p-4">
                <div className="container mx-auto flex items-center">
                    <h1 className="text-2xl font-bold text-white">PassK</h1>
                    <span className="ml-auto text-pink-400">BG</span>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                

                <Outlet />
            </main>
        </div>
    );
}
