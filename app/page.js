import RightSidebar from '../components/RightSidebar';
import ConfessionList from '../components/ConfessionList';

export const metadata = {
  title: 'True Confess',
};

export default function Home() {
  return (
    <div className="relative flex justify-center ">
      <main>
        <ConfessionList />
      </main>
      <RightSidebar />
    </div>
  );
}
