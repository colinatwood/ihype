import { redirect } from 'next/navigation';

// /radio/live redirects to /radio — the live player and saved shows are both there
export default function RadioLivePage() {
  redirect('/radio');
}
