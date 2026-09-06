import Link from 'next/link';
import { TranscriptCaptureForm } from '@/components/transcript-capture-form';

export default function CapturePage() {
  return (
    <main className="shell capture-shell">
      <header className="topbar">
        <Link className="brand" href="/">
          kivi<span>.</span>
        </Link>
        <p>Capture</p>
        <Link href="/">Back to Today</Link>
      </header>
      <section className="hero">
        <p className="eyebrow">Evidence-first capture</p>
        <h1>Review what Kivi remembers before it is saved.</h1>
        <p className="lede">
          The source statement stays linked to the memory. A proposal is reviewed first; it is never
          silently created.
        </p>
      </section>
      <TranscriptCaptureForm />
    </main>
  );
}
