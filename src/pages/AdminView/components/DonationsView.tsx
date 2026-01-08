import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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

export const DonationsView = ({ recentDonations, formatCurrency }: DonationsViewProps) => {
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
            {recentDonations.map((donation) => (
              <TableRow key={donation.id}>
                <TableCell className="font-medium">{donation.donor}</TableCell>
                <TableCell>{donation.project}</TableCell>
                <TableCell className="text-right font-semibold text-green-600">
                  {formatCurrency(donation.amount)}
                </TableCell>
                <TableCell className="text-muted-foreground">{donation.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
