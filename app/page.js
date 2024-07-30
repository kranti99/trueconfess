import React from 'react'
import { Metadata } from 'next'
import ConfessionList from '../components/ConfessionList';
import ConfessionForm from '../components/ConfessionForm';
// import Header from '@components/header/page';

export const metadata = {
  title: 'Confession Site',
}
export default function Home() {
  return (
    <div>
      <main className="container mx-auto px-4">
        <h1 className="text-3xl font-bold my-4">Confessions</h1>
        <ConfessionForm />
        <ConfessionList />
        
      </main>
    </div>
  );
}
