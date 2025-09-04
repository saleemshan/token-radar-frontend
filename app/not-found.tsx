'use client';
import { Metadata } from 'next';
import Link from 'next/link';
import React from 'react';

export const metadata: Metadata = {
  title: '404 - Page Not Found',
};

const NotFound = () => {
  return (
    <div className="flex flex-col justify-center items-center flex-1">
      <div className="flex items-center divide-x mb-4">
        <div className="text-xl px-3">404</div>
        <div className="px-3">This page could not be found.</div>
      </div>
      <Link href={`/`} className="hover:underline">
        Back to home
      </Link>
    </div>
  );
};

export default NotFound;
