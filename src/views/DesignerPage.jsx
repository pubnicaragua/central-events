// "use client"

// import * as React from "react"
// import { Calendar, ImageIcon, Minus, Plus, Share2 } from "lucide-react"
// import { useDropzone } from "react-dropzone"

// import { Button } from "@/components/ui/button"
// import { Card, CardContent } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// export default function PageDesignerPage() {
//   const [bgColor, setBgColor] = React.useState("#7a5eb9")
//   const [contentBgColor, setContentBgColor] = React.useState("#ffffff")
//   const [coverImage, setCoverImage] = React.useState<string | null>(null)
//   const [quantity, setQuantity] = React.useState(0)

//   const { getRootProps, getInputProps } = useDropzone({
//     accept: {
//       "image/*": [],
//     },
//     onDrop: (acceptedFiles) => {
//       const file = acceptedFiles[0]
//       const reader = new FileReader()
//       reader.onload = () => {
//         setCoverImage(reader.result as string)
//       }
//       reader.readAsDataURL(file)
//     },
//   })

//   return (
//     <div className="grid h-screen grid-cols-[300px,1fr]">
//       {/* Sidebar */}
//       <div className="border-r bg-background p-4">
//         <h1 className="mb-4 text-lg font-semibold">Diseño de página de inicio</h1>

//         <div className="space-y-6">
//           <div>
//             <h2 className="mb-2 font-medium">Cubrir</h2>
//             <div
//               {...getRootProps()}
//               className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-4 text-center hover:bg-accent"
//             >
//               <input {...getInputProps()} />
//               <ImageIcon className="mb-2 h-8 w-8 text-muted-foreground" />
//               <div className="space-y-1">
//                 <p className="text-sm font-medium">Subir portada</p>
//                 <p className="text-xs text-muted-foreground">Arrastra y suelta o haz clic</p>
//               </div>
//             </div>
//           </div>

//           <div>
//             <h2 className="mb-4 font-medium">Colores</h2>
//             <div className="space-y-4">
//               <div>
//                 <Label>Tipo de fondo</Label>
//                 <Select defaultValue="color">
//                   <SelectTrigger>
//                     <SelectValue placeholder="Elige un color para tu fondo" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="color">Color</SelectItem>
//                     <SelectItem value="gradient">Gradiente</SelectItem>
//                     <SelectItem value="image">Imagen</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div>
//                 <Label>Color de fondo de la página</Label>
//                 <div className="flex gap-2">
//                   <div className="h-10 w-10 rounded-lg border" style={{ backgroundColor: bgColor }} />
//                   <Input value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
//                 </div>
//               </div>

//               <div>
//                 <Label>Color de fondo del contenido</Label>
//                 <div className="flex gap-2">
//                   <div className="h-10 w-10 rounded-lg border" style={{ backgroundColor: contentBgColor }} />
//                   <Input value={contentBgColor} onChange={(e) => setContentBgColor(e.target.value)} />
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Preview */}
//       <div className="relative" style={{ backgroundColor: bgColor }}>
//         {coverImage && (
//           <div className="absolute inset-0">
//             <img src={coverImage || "/placeholder.svg"} alt="Cover" className="h-full w-full object-cover" />
//           </div>
//         )}
//         <div className="relative min-h-full p-8">
//           <Card className="mx-auto max-w-2xl" style={{ backgroundColor: contentBgColor }}>
//             <CardContent className="p-6">
//               <div className="mb-8 flex items-start justify-between">
//                 <div>
//                   <div className="mb-4 text-sm text-muted-foreground">FEB 15, 2025 3:30PM</div>
//                   <h1 className="text-4xl font-bold">Nuevo Evento</h1>
//                 </div>
//                 <TooltipProvider>
//                   <Tooltip>
//                     <TooltipTrigger asChild>
//                       <Button variant="ghost" size="icon">
//                         <Share2 className="h-4 w-4" />
//                       </Button>
//                     </TooltipTrigger>
//                     <TooltipContent>
//                       <p>Compartir</p>
//                     </TooltipContent>
//                   </Tooltip>
//                 </TooltipProvider>
//               </div>

//               <div className="mb-8">
//                 <h2 className="mb-4 text-xl font-semibold">Fecha y hora</h2>
//                 <div className="flex items-center gap-2 text-muted-foreground">
//                   <Calendar className="h-4 w-4" />
//                   <span>Sat, Feb 15, 2025 3:30 PM - Sun, Feb 16, 2025 8:30 PM CST</span>
//                 </div>
//               </div>

//               <div>
//                 <h2 className="mb-4 text-xl font-semibold">Entradas</h2>
//                 <div className="rounded-lg border p-4">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <h3 className="text-lg font-medium">Entrada VIP</h3>
//                       <p className="text-sm text-muted-foreground">Entradas VIP</p>
//                     </div>
//                     <div className="flex items-center gap-4">
//                       <div className="text-lg font-semibold">$10.00</div>
//                       <div className="flex items-center gap-2">
//                         <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(0, quantity - 1))}>
//                           <Minus className="h-4 w-4" />
//                         </Button>
//                         <div className="w-8 text-center">{quantity}</div>
//                         <Button variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)}>
//                           <Plus className="h-4 w-4" />
//                         </Button>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </div>
//   )
// }


export default function Home(){
  return (
      <div className="font-bold">
          Desiger page

      </div>
  )
}

