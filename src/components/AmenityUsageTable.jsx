export default function AmenityUsageTable({ amenities }) {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amenidad
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Usados
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Restantes
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            % Uso
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {amenities.map((amenity, index) => {
                        const usagePercentage = amenity.total > 0 ? Math.round((amenity.used / amenity.total) * 100) : 0

                        return (
                            <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{amenity.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{amenity.total}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{amenity.used}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{amenity.remaining}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="flex items-center">
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <div
                                                className={`h-2.5 rounded-full ${usagePercentage > 80 ? "bg-red-500" : usagePercentage > 50 ? "bg-yellow-500" : "bg-green-500"
                                                    }`}
                                                style={{ width: `${usagePercentage}%` }}
                                            ></div>
                                        </div>
                                        <span className="ml-2">{usagePercentage}%</span>
                                    </div>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}
