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
          Paste one raw statement. Sarvam may suggest explicit memories, but the source stays linked
          and you review the final wording before anything is created. Switch on Incognito when this
          capture should not leave this device.
        </p>
      </section>
      <TranscriptCaptureForm />
    </main>
  );
}
