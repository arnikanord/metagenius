import { MetaGeneratorTable } from '@/components/meta-generator-table';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-12 bg-background">
      <MetaGeneratorTable />
    </main>
  );
}
