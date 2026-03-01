import { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/use-translation';
import { useAuth } from '../../context/auth-context';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useStyles } from '../../hooks/use-styles';
import { useRouter } from 'next/navigation';

const mobileStyles = {
    deleteWrapper: "flex flex-col justify-center items-center w-full mt-8",
    deleteBtn: "w-full py-3 bg-red-600 text-white rounded-lg font-bold",
    modalOverlay: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4",
    modalContent: "bg-white p-6 rounded-2xl max-w-md w-full shadow-2xl",
    confirmInput: "border-2 border-gray-200 rounded-lg p-2 w-full mt-4 focus:border-red-500 outline-none"
};

const desktopStyles = {
    deleteWrapper: "flex flex-col justify-center items-center w-full mt-10",
    deleteBtn: "bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-xl transition-colors",
    modalOverlay: "fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-50",
    modalContent: "bg-white p-8 rounded-2xl max-w-lg w-full transform transition-all",
    confirmInput: "border-2 border-red-100 rounded-xl p-3 w-full mt-4 focus:border-red-500 outline-none"
};

export default function PlayerDeleteUI() {
    const router = useRouter();
    const { t } = useTranslation();
    const { logout } = useAuth();
    const { styles } = useStyles(mobileStyles, desktopStyles);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [confirmationText, setConfirmationText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    // Helper para obtener el token
    const getCsrfToken = () => {
        return document.cookie
            .split('; ')
            .find(row => row.startsWith('csrf_token='))
            ?.split('=')[1];
    };

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        const csrfToken = getCsrfToken();

        try {

            const response = await fetch('/api/auth/deleteme', {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'x-csrf-token': csrfToken || '',
                },
            });

            if (response.ok) {
                // Redirigir al inicio o página de despedida
				logout();
				router.push('/');
            } else {
                console.error("Error al borrar cuenta");
                setIsDeleting(false);
            }
        } catch (error) {
            console.error("Network error:", error);
            setIsDeleting(false);
        }
    };

    return (
        <div className={styles.deleteWrapper}>
            {/* Botón Principal */}
            <button 
                className={styles.deleteBtn} 
                onClick={() => setIsModalOpen(true)}
            >
                {t?.user?.deleteBtn}
            </button>

            {/* Modal de Advertencia */}
            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">
                            {t?.user?.deleteAccountTitle || "¿Estás absolutamente seguro?"}
                        </h2>
                        
                        <p className="text-gray-600 mb-4">
                            {t?.user?.deleteAccountWarning || "Esta acción no se puede deshacer. Se borrarán tus estadísticas, amigos y progreso."}
                        </p>

                        <p className="text-sm text-gray-500 font-medium">
                            Escribe <span className="font-bold text-red-600 underline">CONFIRM</span> para continuar:
                        </p>

                        <input 
                            type="text"
                            className={styles.confirmInput}
                            placeholder="CONFIRM"
                            value={confirmationText}
                            onChange={(e) => setConfirmationText(e.target.value)}
                        />

                        <div className="flex gap-4 mt-8">
                            <button 
                                className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setConfirmationText('');
                                }}
                                disabled={isDeleting}
                            >
                                {t?.common?.cancel || "Cancelar"}
                            </button>

                            <button 
                                className={`flex-1 py-3 px-4 rounded-xl font-semibold text-white transition-all ${
                                    confirmationText === 'CONFIRM' && !isDeleting
                                    ? 'bg-red-600 hover:bg-red-800 shadow-lg' 
                                    : 'bg-red-300 cursor-not-allowed'
                                }`}
                                onClick={handleDeleteAccount}
                                disabled={confirmationText !== 'CONFIRM' || isDeleting}
                            >
                                {isDeleting ? "..." : (t?.user?.confirmDelete || "Borrar Cuenta")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
