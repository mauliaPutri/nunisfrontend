"use client"
// pages/index.js
import { useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>Blur Ball Following Mouse</title>
      </Head>
      <div className="animatedBackground"></div>
      <div id="ball">hoy</div>
    </>
  );
}
