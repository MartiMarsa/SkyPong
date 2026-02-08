'use client';

import  { useState } from 'react';
import { useStyles } from '../hooks/use-styles';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema } from "../lib/form-validation/auth";
import { useTranslation } from '../hooks/use-translation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';


const mobileStyles = {
    main: "flex flex-col justify-center items-center min-h-screen",
    goBackWrapper: "absolute top-4 left-4",
    spanTitle: "text-center text-sm mb-2",
    h1: "text-lg text-center",
    article: 'flex flex-col justify-center items-center max-w-2xs',
    textInput: 'text-center h-10 border border-gray-300 rounded',
    submitButton: 'p-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 w-full',
}

const desktopStyles = {
    main: "flex flex-col justify-center items-center min-h-screen",
    goBackWrapper: "absolute top-4 left-4",
    spanTitle: "text-center text-lg mb-2",
    h1: "text-xl",
    article: 'flex flex-col justify-center items-center max-w-md',
    textInput: 'text-center h-8 border border-gray-300 rounded',
    submitButton: 'p-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 w-full',
}


export default function SignUpPage()
{
    const { t } = useTranslation();
    const { styles } = useStyles(mobileStyles, desktopStyles);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(signUpSchema(t)),
    });

    const onSubmit = (data) => {
        console.log("Datos validados:", data);
        // Call API here
    };

    return (
        <main className={styles.main}>
                <div className={ styles.goBackWrapper }>
                    <Link href="/"> <FontAwesomeIcon icon={faArrowLeft} /> {t.form.goBackHome}</Link>
                </div>
            <article className={styles.article}> 
                <span className={styles.spanTitle}>{t.signUpPage.title}</span>
                <h1 className={styles.h1}>{t.homePage.title}</h1>
                <form className='flex flex-col pa-4 gap-4' action="/api/auth/signup" method="POST">

                    <input className={styles.textInput} type="email" id="email" name="email" required placeholder={t.form.emailPlaceholder} />
                    
                    <input className={styles.textInput} type="password" id="password" name="password" required placeholder={t.signUpPage.newPasswordLabel} />
                    <input className={styles.textInput} type="password" id="confirmPassword" name="confirmPassword" required placeholder={t.signUpPage.confirmPasswordLabel} />

                    <button className={styles.submitButton} type="submit">{t.signUpPage.submitButton}</button>
                </form>
                <div className="register-wrapper flex flex-row justify-between gap-4">
                    <div className='signup-cta flex flex-col'>
                        <Link href="/signin">{t.signUpPage.hasAccount}</Link>
                    </div>
                </div>
            </article>
        </main>
    );
}