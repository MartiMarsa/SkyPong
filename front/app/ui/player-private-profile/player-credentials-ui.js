import { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/use-translation';
import { useAuth } from '../../context/auth-context';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useStyles } from '../../hooks/use-styles';
import { useRouter } from 'next/navigation';
import { playerDataSchema } from '../../lib/form-validation/player-data'

const mobileStyles = {
    main: "flex flex-col justify-center items-center min-h-screen",
    playerDataForm: "flex flex-col m-80 center p-5 gap-4 border-4 border-amber-400 rounded-sm",
    inputWrapper: "border border-black",
    inputBox: "border border-black w-full h-10 rounded-md",
    textInputError: 'w-full h-10 px-3 border border-red-500 rounded',
    submitButton: 'p-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 w-full rounded',
};

const desktopStyles = {
    main: "flex flex-col justify-center items-center min-h-screen",
    playerDataForm: "flex flex-col m-80 center p-5 gap-4 border-4 border-amber-400 rounded-sm",
    inputWrapper: "w-full",
    inputBox: "border border-black w-full h-10 rounded-md",
    textInputError: 'w-full h-8 px-3 border border-red-500 rounded',
    submitButton: 'p-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 w-full rounded',
};

export default function PlayerCredentialsUI({ userURL })
{
    const router = useRouter();
    const { user, authloading, checkAuth } = useAuth();
    const { t } = useTranslation();
    const { styles } = useStyles(mobileStyles, desktopStyles);
    const [serverError, setServerError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [player, setPlayer] = useState('');
    
    const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(playerDataSchema(t)),
        mode: 'onBlur',
    });

      useEffect(() => {
    // 1. Si el AuthContext aún está verificando la cookie, esperamos.
    if (authloading) return;

    // 2. Si ya terminó de cargar y NO hay usuario, mandamos a home.
    if (!user) {
        router.push('/');
        return;
    }

    const fetchMyProfile = async () => {
        // Iniciamos carga local para el perfil
        setIsLoading(true); 
        setServerError('');
        if (player)
            return;
        try {
            console.log("Solicitando perfil para ID:", user.id);
            
            const response = await fetch(`/api/profile/users/${user.id}`, {
                method: 'GET',
                credentials: 'include',
            });

            if (!response.ok) {
                if (response.status === 404)
                    setServerError(t.serverError.notFound);
                else 
                    setServerError(t.serverError.unknownError);
                return;
            }

            const data = await response.json();
            console.log("Datos recibidos:", data);
            
            // Seteamos el player con los datos de la API
            setPlayer(data.user); 
            if (data.user) {
                setValue('nickname', data.user.nickname || '');
                console.info("Winphrase data: ", data.user.winPhrase);
                setValue('winPhrase', data.user.winPhrase || '');
            }

        } catch (error)
        {
            console.error('Error en fetchMyProfile:', error);
            setServerError(t.serverError.conectionError);
        } finally
        {
            // Solo dejamos de cargar cuando la petición termina (éxito o error)
            setIsLoading(false);
        }
    };

    fetchMyProfile();
}, [authloading, user, router]); 

    // ✅ Handler para actualizar datos
    const onSubmit = async (data) => {
        try {
            setIsLoading(true);
            setServerError('');
            console.log("Submitting updated profile data info...")
            const response = await fetch(`/api/profile/updateme`, {
                method: 'PATCH',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                setServerError(errorData.error?.message || 'Error al actualizar');
                return;
            }

            const result = await response.json();
            console.log('Perfil actualizado:', result);
            
            // Actualiza el player local
            setPlayer(result.user);
            console.info("Updated player: ", player);
            
        } catch (error) {
            console.error('Error actualizando perfil:', error);
            setServerError(t.serverError.conectionError);
        } finally {
            setIsLoading(false);
        }
    };

    // Muestra loading
    if (authloading || isLoading) {
        return (
            <div className={styles.main}>
                <p>Cargando perfil...</p>
            </div>
        );
    }

    // Muestra error si no hay player
    if (!player) {
        return (
            <div className={styles.main}>
                <p className="text-red-500">
                    {serverError || 'No se pudo cargar el perfil'}
                </p>
                <button onClick={() => router.push('/')}>
                    Volver al inicio
                </button>
            </div>
        );
    }

    return (
        <>
        { isLoading ? (
            <>
                <img src={`/api/profile/avatars/${user.id}.webp`} />
            </>
            ) :
            (
                <>
                    <form id="playerCredentialsForm" onSubmit={handleSubmit(onSubmit, (errors) => console.log("Errores de validación:", errors))} className={styles.playerDataForm}>
                        <h1 className={styles.passwordTitle}>{t.form.changePassword}</h1>
                            {/* Password Field */}
                            <div className={styles.inputWrapper}>
                                <input 
                                    className={errors.password ? styles.textInputError : styles.inputBox}
                                    type="password" 
                                    placeholder={t.signUpPage.newPasswordLabel}
                                    autoComplete="new-password"
                                    {...register('password')}  
                                />
                            </div>

                            {/* Confirm Password Field */}
                            <div className={styles.inputWrapper}>
                                <input 
                                    className={errors.confirmPassword ? styles.textInputError : styles.inputBox}
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
                    </>
            )
        }
        </>
    );
}