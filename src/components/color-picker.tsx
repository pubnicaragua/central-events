"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface ColorPickerProps {
    value: string
    onChange: (value: string) => void
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
    const [color, setColor] = useState(value)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        setColor(value)
    }, [value])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newColor = e.target.value
        setColor(newColor)
        onChange(newColor)
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button
                    className="w-10 h-10 rounded-md border shadow-sm"
                    style={{ backgroundColor: color }}
                    aria-label="Seleccionar color"
                />
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3">
                <div className="flex flex-col gap-2">
                    <input
                        ref={inputRef}
                        type="color"
                        value={color}
                        onChange={handleChange}
                        className="w-48 h-48 cursor-pointer"
                    />
                    <input
                        type="text"
                        value={color}
                        onChange={(e) => {
                            setColor(e.target.value)
                            if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                                onChange(e.target.value)
                            }
                        }}
                        className="px-2 py-1 border rounded text-xs font-mono"
                    />
                </div>
            </PopoverContent>
        </Popover>
    )
}

