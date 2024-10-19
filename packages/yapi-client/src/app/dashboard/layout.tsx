'use client';
import React from "react";
import { useRouter } from 'next/navigation';

export default function Layout({ children, }: Readonly<{ children: React.ReactNode; }>) {
  const router = useRouter();
  return (
    <div style={{ display: 'flex', width: '100%', height: '100%' }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: 200,
          backgroundColor: 'gray',
          height: '100%',
        }}
      >
        <div
          onClick={() => {
            router.push('/dashboard');
          }}
        >
          page页面
        </div>
        <div
          onClick={() => {
            router.push('/dashboard/home');
          }}
        >
          第一个页面
        </div>
        <div
          onClick={() => {
            router.push('/dashboard/mine');
          }}
        >
          第二个页面
        </div>
      </div>
      <div style={{ display: 'flex', flex: 1 }}>{children}</div>
    </div>
  );
}
