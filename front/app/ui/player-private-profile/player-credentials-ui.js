import { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/use-translation';
import { useAuth } from '../../context/auth-context';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useStyles } from '../../hooks/use-styles';
import { useRouter } from 'next/navigation';
import { playerPasswordSchema } from '../../lib/form-validation/player-data'

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
        resolver: zodResolver(playerPasswordSchema(t)),
        mode: 'onBlur',
    });

    // ✅ Handler para actualizar datos
    const onSubmit = async (formData) => {
        try {
            setIsLoading(true);
            setServerError('');
            console.info("Submitting updated profile password info...\n", formData)
            const response = await fetch(`/api/auth/password`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    old_password: formData.old_password,
                    new_password: formData.new_password,
                }),
            });

            if (response.status === 204) {
                alert("Contraseña actualizada. Por seguridad, vuelve a iniciar sesión.");
                router.push('/login');
                return;
            }

            if (!response.ok) {
                const errorData = await response.json();
                setServerError(errorData.error?.message || 'Error al actualizar');
                return;
            }

        } catch (error) {
            console.error('Error actualizando contraseña:', error);
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


  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.playerDataForm}>
        {/* NUEVO: Campo para password antiguo */}
        <div className={styles.inputWrapper}>
            <input 
                className={styles.inputBox}
                type="password" 
                placeholder={t.signUpPage.currentPassword}
                {...register('old_password')} // Asegúrate que Zod lo tenga
            />
            {errors.old_password && <p>{errors.old_password.message}</p>}
        </div>

        {/* Password Nuevo */}
        <div className={styles.inputWrapper}>
            <input 
                className={styles.inputBox}
                type="password" 
                placeholder={t.signUpPage.newPasswordLabel}
                {...register('new_password')}  
            />
            {errors.password && <p>{errors.password.message}</p>}
        </div>

        {/* Confirmación Password Nuevo */}
        <div className={styles.inputWrapper}>
            <input 
                className={styles.inputBox}
                type="password" 
                placeholder={t.signUpPage.confirmPasswordLabel}
                {...register('confirm_password')}  
            />
            {errors.password && <p>{errors.password.message}</p>}
        </div>


        <button type="submit" className={styles.submitButton} disabled={isLoading || isSubmitting}>
            {isLoading ? t.form.submitting : t.signUpPage.submitButton}
        </button>
        
        {serverError && <p className={styles.errorMessage}>{serverError}</p>}
    </form>
); 
}