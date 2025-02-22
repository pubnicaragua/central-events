import PropTypes from "prop-types"
import { Ticket, BanknoteIcon, Gift, ArrowUpDown } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

export function TicketTypeSelector({ value, onChange }) {
  return (
    <RadioGroup onValueChange={onChange} value={value} className="grid grid-cols-2 gap-4">
      <div className="relative rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent">
        <RadioGroupItem value="paid" id="paid" className="absolute right-4 top-4" />
        <Label htmlFor="paid" className="flex flex-col gap-2">
          <BanknoteIcon className="h-6 w-6" />
          <span className="font-semibold">Boleto pagado</span>
          <span className="text-xs text-muted-foreground">Billete estándar con precio fijo.</span>
        </Label>
      </div>
      <div className="relative rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent">
        <RadioGroupItem value="free" id="free" className="absolute right-4 top-4" />
        <Label htmlFor="free" className="flex flex-col gap-2">
          <Gift className="h-6 w-6" />
          <span className="font-semibold">Boleto gratis</span>
          <span className="text-xs text-muted-foreground">Entrada gratuita, no se requiere información de pago.</span>
        </Label>
      </div>
      <div className="relative rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent">
        <RadioGroupItem value="donation" id="donation" className="absolute right-4 top-4" />
        <Label htmlFor="donation" className="flex flex-col gap-2">
          <Ticket className="h-6 w-6" />
          <span className="font-semibold">Donación / Pague la entrada que desee</span>
          <span className="text-xs text-muted-foreground">
            Fijar un precio mínimo y dejar que los usuarios paguen más si lo desean.
          </span>
        </Label>
      </div>
      <div className="relative rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent">
        <RadioGroupItem value="tiered" id="tiered" className="absolute right-4 top-4" />
        <Label htmlFor="tiered" className="flex flex-col gap-2">
          <ArrowUpDown className="h-6 w-6" />
          <span className="font-semibold">Boleto escalonado</span>
          <span className="text-xs text-muted-foreground">
            Múltiples opciones de precios. Perfecto para entradas anticipadas, etc.
          </span>
        </Label>
      </div>
    </RadioGroup>
  )
}

TicketTypeSelector.propTypes = {
  value: PropTypes.oneOf(["paid", "free", "donation", "tiered"]).isRequired,
  onChange: PropTypes.func.isRequired,
}

