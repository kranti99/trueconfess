'use client';

import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth } from '../firebase'; // Ensure you import the initialized auth instance

const withAuth = (Component) => {
  const AuthenticatedComponent = (props) => {
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const router = useRouter();

    useEffect(() => {
      setIsClient(true);
    }, []);

    useEffect(() => {
      if (isClient) {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
            setAuthenticated(true);
          } else {
            setAuthenticated(false);
            router.push('/login');
          }
          setLoading(false);
        });

        return () => unsubscribe();
      }
    }, [router, isClient]);

    if (loading || !isClient) {
      return <p>Loading...</p>;
    }

    if (!authenticated) {
      return null;
    }

    return <Component {...props} />;
  };

  AuthenticatedComponent.displayName = `withAuth(${Component.displayName || Component.name || 'Component'})`;

  return AuthenticatedComponent;
};

export default withAuth;
