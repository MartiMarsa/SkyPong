import { title } from "node:process";
import { l } from "../localizer";

const es = {
    homePage: {
    title: "Pongo Porco",
    welcome: "Bienvenido a Transcendence",
    description: "Una experiencia trascendental de Pong",
    },
    gameMode: {
        cta: "¿Quieres jugar en remoto? Inicia sesión para acceder al modo multijugador en línea.",
        chooseMode: "Elige tu modo de juego",
        local: {
            title: "1 vs 1 Local",
            description: "Juega contra un amigo en el mismo dispositivo.",
        },
        ai: {
            title: "1 vs IA",
            description: "Juega contra la computadora.",
        },
        remote: {
            title: "Multijugador en línea",
            description: "Compite contra jugadores de todo el mundo.",
        },
    },
    game: {
        score: "Puntuación",
        pause: "Pausa",
        resume: "Reanudar",
        quit: "Salir",
        playButton: "Jugar",
    },
    legal: {
        terms: "Términos de servicio",
        policy: "Política de privacidad",
    },
    profilePage: {
        title: "Perfil de jugador",
    },
    signInPage: {
        title: "Iniciar sesión",
        noAccountText: "¿No tienes una cuenta?",
        submitButton: "Iniciar sesión",
        passwordForgottenLinkText: "¿Olvidaste tu contraseña?",
    },
    signUpPage: {
        title: "Registrarse",
        hasAccount: "¿Ya tienes una cuenta?",
        passwordLabel: "Contraseña",
        confirmPasswordLabel: "Confirmar contraseña",
        submitButton: "Registrarse",
    },
    remoteRoomLobbyPage: {
        title: "Sala de espera multijugador",
        waitingMessage: "Esperando a que se unan otros jugadores...",
        startButton: "Comenzar juego",
    },
    navigation: {
        home: "Inicio",
        profile: "Perfil",
        logout: "Cerrar sesión",
    },
    player: {
        wins: "Victorias",
        losses: "Derrotas",
        winRate: "Tasa de victorias",
    },
    form: {
        emailLabel: "Correo electrónico",
        passwordLabel: "Contraseña",
        confirmPasswordLabel: "Confirmar contraseña",
        usernameLabel: "Nombre de usuario",
        nickNameLabel: "Apodo",
        invalidEmail: "Por favor, introduce una dirección de correo electrónico válida.",
        passwordTooShort: "La contraseña debe tener al menos 8 caracteres.",
        passwordsDoNotMatch: "Las contraseñas no coinciden.",
        goBackHome: "Volver a Inicio",
        goBack: "Volver",
    },
};



export default es;