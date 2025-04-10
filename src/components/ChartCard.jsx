import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"

export default function ChartCard({ title, children, className = "" }) {
  return (
    <Card className={`${className}`}>
      <CardHeader>
        <CardTitle className="text-md font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">{children}</CardContent>
    </Card>
  )
}
