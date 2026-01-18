'use client';

import { l } from '../lib/i18n/localizer';
import Link from 'next/link';
import { useEffect, useState } from 'react';


export default function TermsPage()
{
    const [backlink, setBacklink] = useState('');

  useEffect(() => {
    // Solo se puede acceder a document en el cliente
    setBacklink(document.referrer);
  }, []);
  return (
    <>
        <main className='flex p-2 justify-center items-stretch min-h-screen align-stretch bg-gradient-to-b from-blue-100 to-blue-300'>
            <div className="terms-content flex column justify-center align-center basis-full md:basis-3/4 lg:basis-1/2 flex flex-col">
                <h1 className="text-3xl font-bold mb-4">{l('legal.termsPage.title')}</h1>
                <div className="terms-text max-h-screen overflow-y-auto p-4 bg-white rounded shadow">
                    {l('legal.termsPage.content')}
                </div>
            </div>
            <div className="back-button">
                <Link href={backlink}>Volver</Link>
            </div>
        </main>
    </>
  );
}