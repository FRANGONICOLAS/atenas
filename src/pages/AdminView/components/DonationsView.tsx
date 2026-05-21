import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Donation {
  id: number | string;
  donor: string;
  project: string;
  amount: number;
  date: string;
}

interface DonationsViewProps {
  recentDonations: Donation[];
  formatCurrency: (amount: number) => string;
}

export const DonationsView = ({
  recentDonations,
  formatCurrency,
}: DonationsViewProps) => {
  const formatDate = (value: string) => {
    const isoDateOnly = /^\d{4}-\d{2}-\d{2}$/;
    const parsed = isoDateOnly.test(value)
      ? new Date(`${value}T00:00:00-05:00`)
      : new Date(value);

    if (Number.isNaN(parsed.getTime())) {
      return value;
    }

    return parsed.toLocaleString("es-CO", {
      timeZone: "America/Bogota",
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Donaciones Recientes</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Donante</TableHead>
              <TableHead>Proyecto</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead>Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentDonations.map((donation, index) => (
              <TableRow key={`${donation.id}-${index}`}>
                <TableCell className="font-medium">{donation.donor}</TableCell>
                <TableCell>{donation.project}</TableCell>
                <TableCell className="text-right font-semibold text-green-600">
                  {formatCurrency(donation.amount)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(donation.date)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
