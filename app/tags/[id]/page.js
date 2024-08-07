'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { db } from '../../../firebase'; // Adjust the path according to your firebase config

const SingleTagPage = () => {
  const { tagId } = useParams();
  const [confessions, setConfessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tagId) {
      const fetchConfessions = async () => {
        try {
          const confessionsRef = db.collection('confessions');
          const querySnapshot = await confessionsRef.where('tags', 'array-contains', tagId).get();
          const confessionsList = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setConfessions(confessionsList);
        } catch (error) {
          console.error('Error fetching confessions: ', error);
        } finally {
          setLoading(false);
        }
      };

      fetchConfessions();
    }
  }, [tagId]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Tag: {tagId}</h1>
      <ul>
        {confessions.map((confession) => (
          <li key={confession.id}>{confession.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default SingleTagPage;
