import RightSidebar from '../components/RightSidebar';
import ConfessionList from '../components/ConfessionList';
import ConfessionForm from '../components/ConfessionForm';

export const metadata = {
  title: 'True Confess',
};

export default function Home() {
  return (
    <div className="relative flex justify-center">
      <main className="container max-w-3xl mx-4 px-4 py-8">
        <h1 className="text-3xl font-bold my-4">Confessions</h1>
        <ConfessionForm />
        <ConfessionList />
      </main>
      <RightSidebar />
    </div>
  );
}
