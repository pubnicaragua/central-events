import PropTypes from "prop-types"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function EventFilters({ searchTerm, setSearchTerm, sortBy, setSortBy, status, setStatus, onFilterChange }) {
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
    onFilterChange()
  }

  const handleSortChange = (value) => {
    setSortBy(value)
    onFilterChange()
  }

  const handleStatusChange = (value) => {
    setStatus(value)
    onFilterChange()
  }

  return (
    <div className="mb-6 space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            type="search"
            placeholder="Buscar por nombre del evento..."
            className="max-w-md"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <Select value={sortBy} onValueChange={handleSortChange}>
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="start_date_desc">Fecha de inicio más reciente</SelectItem>
            <SelectItem value="start_date_asc">Fecha de inicio más antigua</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-4">
        {["Próximo", "Terminado", "Archivado"].map((statusOption) => (
          <button
            key={statusOption}
            onClick={() => handleStatusChange(statusOption)}
            className={`px-4 py-2 ${
              status === statusOption
                ? "border-b-2 border-indigo-600 text-indigo-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            {statusOption}
          </button>
        ))}
      </div>
    </div>
  )
}

EventFilters.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  setSearchTerm: PropTypes.func.isRequired,
  sortBy: PropTypes.string.isRequired,
  setSortBy: PropTypes.func.isRequired,
  status: PropTypes.string.isRequired,
  setStatus: PropTypes.func.isRequired,
  onFilterChange: PropTypes.func.isRequired,
}

