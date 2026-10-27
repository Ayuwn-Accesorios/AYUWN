import AlertBanner from '@/components/layout/AlertBanner';
import Storefront from '@/components/home/Storefront';

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col bg-neutral-50">
      <AlertBanner />
      <Storefront />
    </main>
  );
}