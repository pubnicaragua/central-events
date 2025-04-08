function PrintError(tablename, action, error) {
    console.error(`There was an error ${action} ${tablename}: `, error)
}

/**
 * Añade un evento al calendario del usuario
 * @param {Object} event - El evento a añadir
 * @param {string} event.name - Nombre del evento
 * @param {string} event.description - Descripción del evento
 * @param {string} event.start_date - Fecha de inicio (formato ISO)
 * @param {string} event.end_date - Fecha de fin (formato ISO)
 * @param {string} event.location - Ubicación del evento
 */
function addToCalendar(event) {
    if (!event) return

    // Asegurarse de que tenemos fechas válidas
    const startDate = event.start_date ? new Date(event.start_date) : new Date()
    const endDate = event.end_date ? new Date(event.end_date) : new Date(startDate.getTime() + 3600000) // +1 hora por defecto

    // Formatear fechas para Google Calendar (YYYYMMDDTHHMMSSZ)
    const formatDate = (date) => {
        return date.toISOString().replace(/-|:|\.\d+/g, "")
    }

    const startDateFormatted = formatDate(startDate)
    const endDateFormatted = formatDate(endDate)

    // Crear URL para Google Calendar
    const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.name || "Evento")}&dates=${startDateFormatted}/${endDateFormatted}&details=${encodeURIComponent(event.description || "")}&location=${encodeURIComponent(event.location || "")}&sf=true&output=xml`

    // Abrir en nueva ventana
    window.open(url, "_blank")
}

export default PrintError
export { addToCalendar }

