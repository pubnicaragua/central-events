import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../api/supabase";
import EventCard from "../components/EventCard";
import CreateEventModal from "../components/CreateEventModal";
import CreateOrganizerModal from "../components/CreateOrganizerModal";
import { PlusIcon } from "../components/Icons";

function Events() {
    const [events, setEvents] = useState([]);
    const [organizers, setOrganizers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOrder, setSortOrder] = useState("recent");
    const [activeTab, setActiveTab] = useState("Próximo");
    const [showCreateEventModal, setShowCreateEventModal] = useState(false);
    const [showCreateOrganizerModal, setShowCreateOrganizerModal] = useState(false);
    const [showCreateMenu, setShowCreateMenu] = useState(false);
    const [userId, setUserId] = useState(null);
    const navigate = useNavigate();

    function printError(tablename, action, error) {
        console.error(`There was an error ${action} ${tablename}: `, error);
    }

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) {
                console.error("Usuario no autenticado", userError);
                return;
            }
            setUserId(user.id);
        };
        fetchUser();
    }, []);

    useEffect(() => {
        if (!userId) return;
        fetchEvents(userId);
        fetchOrganizers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, sortOrder, userId]);

    async function fetchEvents(userId) {
        try {
            let status;

            if (activeTab === "Próximo") {
                status = "Próximo"
            } else if (activeTab === "Terminado") {
                status = "Terminado"
            } else if (activeTab === "Archivado") {
                status = "Archivado"
            }

            // Definir el orden dinámicamente
            const isRecent = sortOrder === "recent"

            const { data, error } = await supabase
                .from("events")
                .select("*, organizers:organizer_id(name)")
                .eq("user_id", userId)
                .eq("status", status)
                .order("start_date", { ascending: !isRecent });

            if (error) {
                console.error("Error fetching events:", error);
                return;
            }

            setEvents(data || []);
        } catch (err) {
            console.error("Error inesperado:", err);
        }
    }

    async function fetchOrganizers() {
        const { data, error } = await supabase.from("organizers").select("*");
        if (error) {
            printError("Organizers", "fetching", error);
        } else {
            setOrganizers(data || []);
        }
    }

    const filteredEvents = events.filter((event) =>
        event.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreateEvent = async (eventData) => {
        const { data, error } = await supabase.from("events").insert([eventData]).select();

        if (error) {
            printError("events", "creating", error);
            return;
        }

        if (data && data[0]) {
            navigate(`manage/event/${data[0].id}/settings`);
        }
    };

    const handleCreateOrganizer = async (organizerData) => {
        const { error } = await supabase.from("organizers").insert([organizerData]).select();

        if (error) {
            printError("organizer", "creating", error);
            return;
        }

        setShowCreateOrganizerModal(false);
        fetchOrganizers();
    };

    const handleDuplicateEvent = async (event) => {
        const duplicatedEvent = {
            organizer_id: event.organizer_id,
            name: event.name + " (Copia)",
            description: event.description,
            start_date: event.start_date,
            end_date: event.end_date,
            status: event.status,
            user_id: userId,
        };

        const { error } = await supabase.from("events").insert([duplicatedEvent]).select();

        if (error) {
            printError("event", "duplicating", error);
            return;
        }

        fetchEvents(userId);
    };

    const handleArchiveEvent = async (id) => {
        const { error } = await supabase.from("events").update({ status: "Archivado" }).eq("id", id);

        if (error) {
            printError("events", "archiving", error);
            return;
        }

        fetchEvents(userId);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-7-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-2xl font-bold mb-6">Próximos Eventos</h2>

                    <div className="flex justify-between mb-6">
                        <div className="flex space-x-4">
                            <input
                                type="text"
                                placeholder="Buscar por nombre del evento"
                                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />

                            <select
                                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                            >
                                <option value="recent">Fecha de inicio más reciente</option>
                                <option value="oldest">Fecha de inicio más antigua</option>
                            </select>
                        </div>

                        <div className="relative">
                            <button
                                className="bg-black text-white px-4 py-2 rounded-md flex items-center"
                                onClick={() => setShowCreateMenu(!showCreateMenu)}
                            >
                                <PlusIcon className="w-5 h-5 mr-2" />
                                Crear Nuevo
                            </button>

                            {showCreateMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                                    <div className="py-1">
                                        <button
                                            className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center"
                                            onClick={() => {
                                                setShowCreateEventModal(true);
                                                setShowCreateMenu(false);
                                            }}
                                        >
                                            <span className="mr-2"> 🗕️</span> Evento
                                        </button>
                                        <button
                                            className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center"
                                            onClick={() => {
                                                setShowCreateOrganizerModal(true);
                                                setShowCreateMenu(false);
                                            }}
                                        >
                                            <span className="mr-2">👤</span> Organizador
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="border-b border-gray-200 mb-6">
                        <nav className="-mb-px flex space-x-8">
                            {["Próximo", "Terminado", "Archivado"].map((tab) => (
                                <button
                                    key={tab}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab
                                        ? "border-blue-500 text-blue-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                        }`}
                                    onClick={() => setActiveTab(tab)}
                                >
                                    {tab}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="space-y-4">
                        {filteredEvents.length > 0 ? (
                            filteredEvents.map((event) => (
                                <EventCard
                                    key={event.id}
                                    event={event}
                                    onDuplicate={() => handleDuplicateEvent(event)}
                                    onArchive={() => handleArchiveEvent(event.id)}
                                />
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-8">No hay eventos para mostrar</p>
                        )}
                    </div>
                </div>
            </div>

            {showCreateEventModal && (
                <CreateEventModal
                    organizers={organizers}
                    onClose={() => setShowCreateEventModal(false)}
                    userId={userId}
                    onSubmit={handleCreateEvent}
                />
            )}

            {showCreateOrganizerModal && (
                <CreateOrganizerModal
                    onClose={() => setShowCreateOrganizerModal(false)}
                    onSubmit={handleCreateOrganizer}
                />
            )}
        </div>
    );
}

export default Events;
