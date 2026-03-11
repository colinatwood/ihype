import { redirect } from 'next/navigation';

export default async function DJPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/promoters/${slug}`);
}
