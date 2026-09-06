import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MemoryCorrectionForm } from '@/components/memory-correction-form';
import { getMemoryForCorrection } from '@/server/memory/get-memory-for-correction';

export const dynamic = 'force-dynamic';

export default async function CorrectMemoryPage({
  params,
}: {
  params: Promise<{ memoryId: string }>;
}) {
  const { memoryId } = await params;
  const memory = await getMemoryForCorrection(memoryId);
  if (!memory) notFound();

  return (
    <main className="shell capture-shell">
      <header className="topbar">
        <Link className="brand" href="/">
          kivi<span>.</span>
        </Link>
        <p>Correct memory</p>
        <Link href="/">Back to Today</Link>
      </header>
      <section className="hero">
        <p className="eyebrow">User correction</p>
        <h1>Replace a memory without erasing its history.</h1>
        <p className="lede">
          The old statement will be marked superseded. The correction becomes new, source-linked
          evidence that retrieval can use.
        </p>
      </section>
      <section className="previous-memory">
        <p className="status">Current active memory</p>
        <p>{memory.canonical_statement}</p>
      </section>
      <MemoryCorrectionForm memoryId={memory.id} previousStatement={memory.canonical_statement} />
    </main>
  );
}
