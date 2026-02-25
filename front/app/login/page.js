'use client';

import { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../lib/form-validation/auth";
import { useStyles } from '../hooks/use-styles';
import { useTranslation } from '../hooks/use-translation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/auth-context'

const mobileStyles = {
    main: "flex flex-col justify-center items-center min-h-screen",
    goBackWrapper: "absolute top-4 left-4",
    spanTitle: "text-center text-sm mb-2",
    h1: "text-lg text-center",
    article: 'flex flex-col justify-center items-center max-w-2xs',
    textInput: 'w-full h-10 px-3 border border-gray-300 rounded',
    textInputError: 'w-full h-10 px-3 border border-red-500 rounded',
    submitButton: 'p-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 w-full rounded',
    form: 'flex flex-col p-4 gap-4 w-full',
    errorMessage: 'text-red-500 text-sm mt-1',
    inputWrapper: 'w-full',
    singUpButtonWrapper: 'mt-4 text-center',
};

const desktopStyles = {
    ...mobileStyles,
    spanTitle: "text-center text-lg mb-2",
    h1: "text-xl",
    article: 'flex flex-col justify-center items-center max-w-md w-full',
};

export default function SignInPage() {
    const router = useRouter();
    const { user, checkAuth, hasCredentials } = useAuth();
    const { t } = useTranslation();
    const { styles } = useStyles(mobileStyles, desktopStyles);
    const [serverError, setServerError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(loginSchema(t)),
        mode: 'onBlur',
    });
    
    const redirectHome = async () => {
        const hasCredentials = await checkAuth();
        console.log("User already loggedin: ", user);
        if (hasCredentials)
            router.push('/');
    };

    useEffect(() => {
        redirectHome();
    }, []);

    const onSubmit = async (data) => {
        try {
            setIsLoading(true);
            setServerError(''); // Limpia errores anteriores
            
            console.log("Datos validados:", data);
            // Call API here
            const apiURL = '/api/auth/login'; // Asegúrate de que esta ruta sea correcta
            const response = await fetch(apiURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(data),
            });
            
            const contentType = response.headers.get('content-type');
            
            if (!contentType || !contentType.includes('application/json')) {
                console.error('Response is not JSON:', await response.text());
                setServerError(`Error del servidor. La ruta ${apiURL} no existe o está mal configurada.`);
                return;
            }
            
            
            const result = await response.json();
            console.log("📦 Response status:", response.status);
            console.log("📦 Response completa:", result);
            console.log("📦 result.user:", result.user);
            console.log("📦 Estructura:", JSON.stringify(result, null, 2));
            
            if (!response.ok) {
                // ✅ Maneja diferentes tipos de errores
                if (response.status === 404) {
                    setServerError(t.form.userNotRegistered);
                } else if (response.status === 401) {
                    console.warn("401 Unauthorized: ", t.form.errors.invalidCredentials);
                    setServerError(t.form.errors.invalidCredentials);
                } else if (response.status === 403) {
                    setServerError(t.form.errors.accountBlocked);
                } else {
                    setServerError(result.message || t.form.errors.serverError);
                }
                return;
            }
            
            console.log("Login exitoso:", result);
            const hasCredentials = await checkAuth();
            console.log("Has Credentials: ", hasCredentials);
            if (hasCredentials)
                router.push('/updateme')
            else
                setServerError("Error validating credentials");
        } catch (error) {
            console.error('Error: ', error);
        } finally {
            setIsLoading(false);
        }
    };
    

    return (
        <>
        { isLoading ? (<div className=''>Loading...</div>) : 
        (
        <main className={styles.main}>
            <div className={styles.goBackWrapper}>
                <Link href="/">
                    <FontAwesomeIcon icon={faArrowLeft} /> {t.form.goBackHome}
                </Link>
            </div>
            
            <article className={styles.article}> 
                <span className={styles.spanTitle}>{t.signInPage.title}</span>  
                <h1 className={styles.h1}>{t.homePage.title}</h1>
                
                <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
                    
                    {/* Email Field */}
                    <div className={styles.inputWrapper}>
                        <input 
                            className={errors.email ? styles.textInputError : styles.textInput}
                            type="email" 
                            placeholder={t.form.emailPlaceholder} 
                            autoComplete="email"
                            {...register('email')} 
                        />
                        {errors.email && <p>{errors.email.message}</p>}
                    </div>

                    {/* Password Field */}
                    <div className={styles.inputWrapper}>
                        <input 
                            className={errors.password ? styles.textInputError : styles.textInput}
                            type="password" 
                            placeholder={t.form.passwordLabel} 
                            autoComplete="current-password"
                            {...register('password')}
                        />
                        {errors.password && <p>{errors.password.message}</p>}
                    </div>
                    { serverError && (
                        <p className={styles.errorMessage}>
                            {serverError}
                        </p>
                    )}
                    <button 
                        className={styles.submitButton} 
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? t.signInPage.loading : t.signInPage.submitButton}
                    </button>
                </form>
                <div className={styles.singUpButtonWrapper}>
                    <Link href="/signup">{t.signUpPage.createAccount}</Link>
                </div>
            </article>
        </main>
        )}
        </>
    );
}