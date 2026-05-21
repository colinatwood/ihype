import { RadioStudio } from '@/components/RadioStudio';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Radio Studio',
  description: 'Build and publish radio shows — drag-and-drop tracks, voice overs, and samples.',
};

export default function RadioStudioPage() {
  return <RadioStudio />;
}
