'use client';

import  { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../lib/form-validation/auth";
import { useStyles } from '../hooks/use-styles';
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
    form: 'flex flex-col p-4 gap-4',
    errorMessage: 'text-red-500 text-sm mt-2',
    singUpButtonWrapper: 'mt-4 text-center',
}


export default function SignInPage()
{
    const { t } = useTranslation();
    const { styles } = useStyles(mobileStyles, desktopStyles);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(loginSchema(t)),
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
                <span className={styles.spanTitle}>{t.signInPage.title}</span>  
                <h1 className={styles.h1}>{t.homePage.title}</h1>
                <form className={styles.form} action="/api/auth/signin" method="POST">
                    <input className={styles.textInput} type="email" id="email" name="email" required placeholder={t.form.emailPlaceholder} autoComplete='true' /> 
                    <input className={styles.textInput} type="password" id="password" name="password" required placeholder={t.form.passwordLabel} autoComplete='true'/>
                   <div id="error-message" name="error-message" className={ styles.errorMessage }></div>
                    <button className={ styles.submitButton } type="submit">{t.signInPage.submitButton}</button>
                </form>
                <div className={ styles.singUpButtonWrapper }>
                        <Link href="/signup">{t.signUpPage.createAccount}</Link>
                </div>
            </article>
        </main>
    );
}