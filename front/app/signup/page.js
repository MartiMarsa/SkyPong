'use client';

import { useState, useEffect } from 'react';
import { useStyles } from '../hooks/use-styles';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema } from "../lib/form-validation/auth";
import { useTranslation } from '../hooks/use-translation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/auth-context'
import Link from 'next/link';

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
    registerWrapper: 'mt-4 text-center',
};

const desktopStyles = {
    ...mobileStyles,
    spanTitle: "text-center text-lg mb-2",
    h1: "text-xl",
    article: 'flex flex-col justify-center items-center max-w-md w-full',
    textInput: 'w-full h-8 px-3 border border-gray-300 rounded',
    textInputError: 'w-full h-8 px-3 border border-red-500 rounded',
};

export default function SignUpPage() {
    const router = useRouter();
    const { user, checkAuth } = useAuth();
    const { t } = useTranslation();
    const { styles } = useStyles(mobileStyles, desktopStyles);
    const [serverError, setServerError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(signUpSchema(t)),
        mode: 'onBlur', // Valida cuando el usuario sale del campo
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
            console.log("Datos validados:", data);
            setIsLoading(true);
            setServerError(''); // Limpia errores anteriores
            
            // Llamada a la API
            const response = await fetch('/api/auth/signup', {
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
            console.log("Response ",  response );
            if (!response.ok) {
                    if (response.status === 400) {
                        const result = await response.json();
                        setServerError(result.message || t.form.errors.invalidPassword);
                    }
                    if (response.status === 409) {
                        console.log("Error 409: ", t.form.errors.userAlreadyExists);
                        setServerError(t.form.errors.userAlreadyExists);
                    }
                    else {
                        setServerError(t.form.errors.serverError);
                    }
                    return;
            }

            const result = await response.json();
            const hasCredentials = await checkAuth();
            console.log("Check: ", hasCredentials);
            if (hasCredentials)
            {
                console.log('Signup successful:', result);
                router.push('/me');
            }
            else
                setServerError("Error validating credentials");
        } catch (error) {
            console.error('Error:', error);
        }finally {
            setIsLoading(false);
        }
    };

    return (
        <>
        { isLoading ? (<div className=''>Loading...</div>) : (
            <main className={styles.main}>
                <div className={styles.goBackWrapper}>
                    <Link href="/">
                        <FontAwesomeIcon icon={faArrowLeft} /> {t.form.goBackHome}
                    </Link>
                </div>

                <article className={styles.article}> 
                    <span className={styles.spanTitle}>{t.signUpPage.title}</span>
                    <h1 className={styles.h1}>{t.homePage.title}</h1>
                    
                    {/* Use handleSubmit */}
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
                        </div>

                        {/* Password Field */}
                        <div className={styles.inputWrapper}>
                            <input 
                                className={errors.password ? styles.textInputError : styles.textInput}
                                type="password" 
                                placeholder={t.signUpPage.newPasswordLabel}
                                autoComplete="new-password"
                                {...register('password')}  
                            />
                        </div>

                        {/* Confirm Password Field */}
                        <div className={styles.inputWrapper}>
                            <input 
                                className={errors.confirmPassword ? styles.textInputError : styles.textInput}
                                type="password" 
                                placeholder={t.signUpPage.confirmPasswordLabel}
                                autoComplete="new-password"
                                {...register('confirmPassword')} 
                                />
                        { serverError && (
                            <p className={styles.errorMessage}>
                                    { console.log("Error:", serverError)}
                                    {serverError}
                                </p>
                            )}
                        </div>

                        <button 
                            className={styles.submitButton} 
                            type="submit"
                            disabled={isSubmitting}
                            >
                            {isSubmitting ? t.signUpPage.submitting : t.signUpPage.submitButton}
                        </button>
                    </form>

                    <div className={styles.registerWrapper}>
                        <Link href="/login">{t.signUpPage.hasAccount}</Link>
                    </div>
                </article>
            </main>
                        )}
        </>
    );
}