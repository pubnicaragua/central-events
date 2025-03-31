"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import PropTypes from "prop-types"

function EditAmenityModal({ isOpen, onClose, onSubmit, amenity }) {
    const [formData, setFormData] = useState({
        id: amenity.id,
        name: amenity.name || "",
        description: amenity.description || "",
        price: amenity.price || "",
        quantity: amenity.quantity || "",
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errors, setErrors] = useState({})
    const [isUnlimited, setIsUnlimited] = useState(amenity.quantity === 0)

    useEffect(() => {
        if (amenity) {
            setFormData({
                id: amenity.id,
                name: amenity.name || "",
                description: amenity.description || "",
                price: amenity.price || "",
                quantity: amenity.quantity === 0 ? "" : amenity.quantity || "",
            })
            setIsUnlimited(amenity.quantity === 0)
        }
    }, [amenity])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData({
            ...formData,
            [name]: value,
        })

        // Limpiar error del campo
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: null,
            })
        }
    }

    const validateForm = () => {
        const newErrors = {}

        if (!formData.name.trim()) {
            newErrors.name = "El nombre es obligatorio"
        }

        if (!formData.price || Number.isNaN(Number.parseFloat(formData.price)) || Number.parseFloat(formData.price) < 0) {
            newErrors.price = "El precio debe ser un número válido mayor o igual a 0"
        }

        if (
            !isUnlimited &&
            (!formData.quantity ||
                Number.isNaN(Number.parseInt(formData.quantity)) ||
                Number.parseInt(formData.quantity) <= 0)
        ) {
            newErrors.quantity = "La cantidad debe ser un número entero positivo"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        try {
            setIsSubmitting(true)

            // Preparar los datos para enviar
            const amenityData = {
                ...formData,
                price: Number.parseFloat(formData.price),
                quantity: isUnlimited ? 0 : Number.parseInt(formData.quantity),
            }

            const result = await onSubmit(amenityData)

            if (result.success) {
                onClose()
            }
        } catch (error) {
            console.error("Error submitting form:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Editar amenidad</h3>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                        Nombre <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className={`w-full px-3 py-2 border rounded-md ${errors.name ? "border-red-500" : "border-gray-300"
                                            }`}
                                    />
                                    {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                                </div>

                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                        Descripción
                                    </label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows="3"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                                        Precio <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                                        <input
                                            type="number"
                                            id="price"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleChange}
                                            step="0.01"
                                            min="0"
                                            className={`w-full px-3 py-2 pl-8 border rounded-md ${errors.price ? "border-red-500" : "border-gray-300"
                                                }`}
                                        />
                                    </div>
                                    {errors.price && <p className="mt-1 text-sm text-red-500">{errors.price}</p>}
                                </div>

                                <div>
                                    <div className="flex items-center mb-2">
                                        <input
                                            id="unlimited"
                                            type="checkbox"
                                            checked={isUnlimited}
                                            onChange={() => setIsUnlimited(!isUnlimited)}
                                            className="h-4 w-4 text-purple-600 rounded"
                                        />
                                        <label htmlFor="unlimited" className="ml-2 text-sm text-gray-700">
                                            Cantidad ilimitada
                                        </label>
                                    </div>

                                    {!isUnlimited && (
                                        <>
                                            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                                                Cantidad <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                id="quantity"
                                                name="quantity"
                                                value={formData.quantity}
                                                onChange={handleChange}
                                                min="1"
                                                className={`w-full px-3 py-2 border rounded-md ${errors.quantity ? "border-red-500" : "border-gray-300"
                                                    }`}
                                            />
                                            {errors.quantity && <p className="mt-1 text-sm text-red-500">{errors.quantity}</p>}
                                        </>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>

                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            onClick={handleSubmit}
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Guardando..." : "Guardar cambios"}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

EditAmenityModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    amenity: PropTypes.object.isRequired,
}

export default EditAmenityModal

