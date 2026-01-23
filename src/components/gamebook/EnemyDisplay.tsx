import { Skull } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EnemyDef, EnemyPreset } from '@/types/gamebook';

interface EnemyDisplayProps {
  enemy: EnemyDef | EnemyPreset & { id?: string };
}

export function EnemyDisplay({ enemy }: EnemyDisplayProps) {
  const name = 'name' in enemy ? enemy.name : 'Unknown Enemy';
  const rank = 'rank' in enemy ? enemy.rank : undefined;
  const hayat = 'hayat' in enemy ? enemy.hayat : undefined;
  const attack = 'attack' in enemy ? enemy.attack : undefined;
  const note = 'note' in enemy ? enemy.note : undefined;

  return (
    <Card className="border-destructive/30 bg-destructive/5">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Skull className="h-4 w-4 text-destructive" />
          {name}
          {rank !== undefined && (
            <Badge variant="outline" className="ml-auto">
              Rank {rank}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm space-y-2">
        {(hayat !== undefined || attack !== undefined) && (
          <div className="flex gap-4 text-muted-foreground">
            {hayat !== undefined && <span>HP: {hayat}</span>}
            {attack !== undefined && <span>ATK: {attack}</span>}
          </div>
        )}
        {note && (
          <p className="text-muted-foreground italic text-xs">{note}</p>
        )}
      </CardContent>
    </Card>
  );
}
