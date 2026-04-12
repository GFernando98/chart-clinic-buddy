import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { PeriodontalMeasurement } from '@/types/periodontogram';

interface PerioSummaryProps {
  measurements: PeriodontalMeasurement[];
}

export function PerioSummary({ measurements }: PerioSummaryProps) {
  if (measurements.length === 0) return null;

  const totalPoints = measurements.length;
  const bleedingCount = measurements.filter((m) => m.bleeding).length;
  const plaqueCount = measurements.filter((m) => m.plaque).length;
  const pockets4 = measurements.filter((m) => m.probingDepth >= 4).length;
  const pockets6 = measurements.filter((m) => m.probingDepth >= 6).length;

  const bleedingIndex = totalPoints > 0 ? Math.round((bleedingCount / totalPoints) * 100) : 0;
  const plaqueIndex = totalPoints > 0 ? Math.round((plaqueCount / totalPoints) * 100) : 0;

  const stats = [
    { label: 'Índice de Sangrado', value: `${bleedingIndex}%`, color: bleedingIndex > 20 ? 'text-red-600' : 'text-green-600' },
    { label: 'Índice de Placa', value: `${plaqueIndex}%`, color: plaqueIndex > 20 ? 'text-amber-600' : 'text-green-600' },
    { label: 'Bolsas ≥4mm', value: String(pockets4), color: pockets4 > 0 ? 'text-amber-600' : 'text-green-600' },
    { label: 'Bolsas ≥6mm', value: String(pockets6), color: pockets6 > 0 ? 'text-red-600' : 'text-green-600' },
    { label: 'Puntos Registrados', value: `${totalPoints} / ${32 * 6}`, color: 'text-foreground' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
      {stats.map((stat) => (
        <Card key={stat.label} className="border">
          <CardContent className="p-3 text-center">
            <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-[10px] text-muted-foreground">{stat.label}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
