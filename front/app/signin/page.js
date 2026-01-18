'use client';

import  { useState } from 'react';
import  { l } from '../lib/i18n/localizer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

export default function SignInPage()
{
    return (
        <main className='flex flex-col justify-center align-center min-h-screen'>
            <article className='flex flex-col p-6 max-v-lg:w-632px m-auto gap-4 border border-gray-300 rounded-md shadow-md'> 
                <h1>{l('signInPage.title')}</h1>
                <form className='flex flex-col pa-4 gap-4' action="/api/auth/signin" method="POST">
                    <label htmlFor="email">{l('form.emailLabel')}</label>
                    <input type="email" id="email" name="email" required />
                    
                    <label htmlFor="password">{l('form.passwordLabel')}</label>
                    <input type="password" id="password" name="password" required />
                    
                    <button className='p-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 w-full' type="submit">{l('signInPage.submitButton')}</button>
                </form>
                <div className="register-wrapper flex flex-row justify-between gap-4">
                    <div className='signup-cta flex flex-col'>
                        <p className=''>{l('signInPage.noAccountText')}</p>
                        <Link href="/signup">{l('signUpPage.title')}</Link>
                    </div>
                    <div className='password-recovery-cta'>
                        <Link href="/password-recovery">{l('signInPage.passwordForgottenLinkText')}</Link>
                    </div>
                </div>
                <div className="go-back-wrapper">
                    <Link href="/"> <FontAwesomeIcon icon={faArrowLeft} /> {l('form.goBackHome')}</Link>
                </div>
            </article>
        </main>
    );
}