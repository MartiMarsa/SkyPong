'use client';

import  { useState } from 'react';
import  l from '../lib/i18n/localizer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

export default function SignUpPage()
{
    return (
        <main className='flex flex-col justify-center align-center min-h-screen'>
            <article className='flex flex-col p-6 max-v-lg:w-632px m-auto gap-4 border border-gray-300 rounded-md shadow-md'> 
                <h1>{l('signUpPage.title')}</h1>
                <form className='flex flex-col pa-4 gap-4' action="/api/auth/signup" method="POST">
                    <label htmlFor="nickname">{l('form.nickNameLabel')}</label>
                    <input type="text" id="nickname" name="nickname" required />

                    <label htmlFor="email">{l('form.emailLabel')}</label>
                    <input type="email" id="email" name="email" required />
                    
                    <label htmlFor="password">{l('signUpPage.passwordLabel')}</label>
                    <input type="password" id="password" name="password" required />
                    <label htmlFor="confirmPassword">{l('signUpPage.confirmPasswordLabel')}</label>
                    <input type="password" id="confirmPassword" name="confirmPassword" required />

                    <button className='p-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 w-full' type="submit">{l('signUpPage.submitButton')}</button>
                </form>
                <div className="register-wrapper flex flex-row justify-between gap-4">
                    <div className='signup-cta flex flex-col'>
                        <p className=''>{l('signUpPage.hasAccount')}</p>
                        <Link href="/signin">{l('signInPage.title')}</Link>
                    </div>
                </div>
                <div className="go-back-wrapper">
                    <Link href="/"> <FontAwesomeIcon icon={faArrowLeft} /> {l('form.goBackHome')}</Link>
                </div>
            </article>
        </main>
    );
}