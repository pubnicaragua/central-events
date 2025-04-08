"use client"

interface QRCodeProps {
    moduleColor: string
    backgroundColor: string
    size?: number
    className?: string
}

export function QRCode({ moduleColor, backgroundColor, size = 200, className = "" }: QRCodeProps) {
    return (
        <div
            className={className}
            style={{
                width: size,
                height: size,
                backgroundColor: backgroundColor,
                padding: "1rem",
                borderRadius: "0.5rem",
            }}
        >
            <svg viewBox="0 0 200 200" width={size - 32} height={size - 32} style={{ color: moduleColor }}>
                {/* Código QR simplificado para demostración */}
                <rect x="40" y="40" width="120" height="120" fill={backgroundColor} />
                <g fill="currentColor">
                    {/* Marco exterior */}
                    <rect x="40" y="40" width="30" height="30" />
                    <rect x="130" y="40" width="30" height="30" />
                    <rect x="40" y="130" width="30" height="30" />

                    {/* Patrones de posicionamiento */}
                    <rect x="50" y="50" width="10" height="10" fill={backgroundColor} />
                    <rect x="140" y="50" width="10" height="10" fill={backgroundColor} />
                    <rect x="50" y="140" width="10" height="10" fill={backgroundColor} />

                    {/* Datos del QR (simplificado) */}
                    <rect x="80" y="40" width="10" height="10" />
                    <rect x="100" y="40" width="10" height="10" />
                    <rect x="40" y="80" width="10" height="10" />
                    <rect x="60" y="80" width="10" height="10" />
                    <rect x="80" y="80" width="10" height="10" />
                    <rect x="120" y="80" width="10" height="10" />
                    <rect x="140" y="80" width="10" height="10" />
                    <rect x="40" y="100" width="10" height="10" />
                    <rect x="60" y="100" width="10" height="10" />
                    <rect x="100" y="100" width="10" height="10" />
                    <rect x="120" y="100" width="10" height="10" />
                    <rect x="80" y="120" width="10" height="10" />
                    <rect x="100" y="120" width="10" height="10" />
                    <rect x="120" y="120" width="10" height="10" />
                    <rect x="80" y="140" width="10" height="10" />
                    <rect x="100" y="140" width="10" height="10" />
                    <rect x="120" y="140" width="10" height="10" />
                </g>
            </svg>
        </div>
    )
}

