import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '/firebase'; // Adjust the path to your firebase setup
import Link from 'next/link';
console.log('Tag');

// Fetch data on the server side
export async function generateStaticParams() {
  const tagsSnapshot = await getDocs(collection(db, 'tags'));
  const paths = tagsSnapshot.docs.map((doc) => ({
    slug: doc.id,
  }));

  return paths.map((path) => ({
    slug: path.slug,
  }));
}

export async function generateMetadata({ params }) {
  const tag = params.slug;
  return {
    title: `Tag: ${tag}`,
  };
}

const TagPage = async ({ params }) => {
  const tag = params.slug;
  console.log('Tag');
  console.log(tag);
  const confessionsQuery = query(
    collection(db, 'confessions'),
    where('tags', 'array-contains', tag)
  );

  const confessionsSnapshot = await getDocs(confessionsQuery);

  const confessions = confessionsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return (
    <div className="p-6 bg-dark-background-light rounded-lg text-white shadow-md">
      <h1 className="text-3xl font-bold mb-4">Tag: {tag}</h1>
      {confessions.length > 0 ? (
        <ul>
          {confessions.map((confession) => (
            <li key={confession.id} className="mb-4">
              <Link href={`/confession/${confession.id}`} className="text-blue-500 hover:underline">
                {confession.title}
              </Link>
              <p>{confession.excerpt}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No confessions found for this tag.</p>
      )}
    </div>
  );
};

export default TagPage;
