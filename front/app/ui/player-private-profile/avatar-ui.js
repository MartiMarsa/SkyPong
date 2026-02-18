'use client';
import { useState } from 'react';
import { useAuth } from '../../context/auth-context'; // Ajusta la ruta a tu contexto
import { useTranslation } from '../../hooks/use-translation';

export default function AvatarUpload({ currentAvatar }) {
  const { user } = useAuth();
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [serverError, setServerError] = useState('');
  const { t } = useTranslation(); 
  
  // Imagen por defecto si no hay una previa ni una nueva seleccionada
  const defaultAvatar = "/api/profile/avatars/default-avatar.webp"; 
  const displayImage = preview || currentAvatar || defaultAvatar;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Crear una URL temporal para ver la imagen antes de subirla
      setPreview(URL.createObjectURL(file));
      uploadFile(file);
    }
  };

  const uploadFile = async (file) => {
    if (!user) return;
    
    setUploading(true);
    const formData = new FormData();
    // Importante: El nombre 'avatar' debe coincidir con lo que espere tu backend
    formData.append('uploads', file);

    try {
        const csrfToken = document.cookie
            .split('; ')
            .find(row => row.startsWith('csrf_token='))
            ?.split('=')[1];

        const response = await fetch('/api/profile/avatar', {
            method: 'POST',
            body: formData, // El navegador se encarga del Content-Type
            credentials: 'include',
            headers: {
                'x-csrf-token': csrfToken || '', // <-- para el middleware de CSRF
            }
        });

        if (!response.ok)
        {
          console.error("Fallo en la subida. Status: ", response.status, "Error: ", response.error);

          if(response.status === 413)
           setServerError(t.avatar.error.tooLarge);
          else if (response.status === 400)
           setServerError(t.avatar.error.invalidImageFile);
          else if(response.error === 2)
            setServerError(t.avatar.error.invalidFormat);
          else
            setServerError(t.avatar.error.unknownError);
          return;
        }
        console.info("Avatar uploaded: ", response);
    } catch (error) {
      console.error("Error avatar: ", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-32 h-32 overflow-hidden rounded-full border-2 border-gray-300">
        { console.info("Displayed image: ", displayImage)}
        <img 
          src={displayImage} 
          alt="Avatar" 
          className="w-full h-full object-cover"
        />
        {uploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs">
            Subiendo...
          </div>
        )}
      </div>

      <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
        {uploading ? 'Cargando...' : 'Cambiar Imagen'}
        <input 
          type="file" 
          className="hidden" 
          accept="image/png, image/jpeg" 
          onChange={handleFileChange}
          disabled={uploading}
        />
      </label>
      <div className="" name="avatar-error">
        { serverError }
      </div>
    </div>
  );
}