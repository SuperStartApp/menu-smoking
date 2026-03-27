import { redirect } from 'next/navigation';

export default function Home() {
  // Reindirizziamo automaticamente all'admin per ora
  redirect('/admin');
}