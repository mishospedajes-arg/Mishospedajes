export const dynamic = 'force-dynamic';

import { fetchAllChalets } from '@/lib/data';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import ChaletsTable from '@/components/custom/ChaletsTable';

export default async function ChaletsPage() {
  const chalets = await fetchAllChalets();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gestión de Chalets</h1>
        <Button asChild>
          <Link href="/admin/chalets/new">Agregar Chalet</Link>
        </Button>
      </div>
      <ChaletsTable initialChalets={chalets} />
    </div>
  );
}
