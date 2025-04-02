"use client"

import type React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { Trash } from "lucide-react"
import ConfirmDialog from "../../components/confirm-dialog"
import { useState } from "react"

interface VerGanadoresModalProps {
  isOpen: boolean
  onClose: () => void
  raffle: any
  winners: any[]
  onRemoveWinner: (attendeeId: string) => void
}

const VerGanadoresModal: React.FC<VerGanadoresModalProps> = ({ isOpen, onClose, raffle, winners, onRemoveWinner }) => {
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [selectedWinner, setSelectedWinner] = useState(null)

  const handleRemoveWinner = (winner) => {
    setSelectedWinner(winner)
    setConfirmDialogOpen(true)
  }

  const confirmRemoveWinner = () => {
    onRemoveWinner(selectedWinner.id)
    setConfirmDialogOpen(false)
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Ganadores de: {raffle?.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Lista de ganadores</h3>
              <Badge variant="outline">
                {winners.length} {winners.length === 1 ? "ganador" : "ganadores"}
              </Badge>
            </div>

            {winners.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No hay ganadores registrados</div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                {winners.map((winner) => (
                  <div key={winner.id} className="px-4 py-3 border-b last:border-b-0 flex justify-between items-center">
                    <div>
                      <p className="font-medium">
                        {winner.name} {winner.second_name}
                      </p>
                      <p className="text-sm text-gray-500">{winner.email || "Sin email"}</p>
                      <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">{winner.code}</code>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveWinner(winner)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={onClose}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={confirmRemoveWinner}
        title="Eliminar ganador"
        description={`¿Estás seguro de que deseas eliminar a ${selectedWinner?.name} ${selectedWinner?.second_name || ""} como ganador de esta rifa?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </>
  )
}

export default VerGanadoresModal

