import { create } from "node:domain";
import { title } from "node:process";

const es = {
    homePage: {
    title: "SkyPong",
    welcome: "Bienvenido al cielo del Pong",
    description: "Una experiencia celestial de Pong",
    lable: "Ir a la Home",
    },
    user: {
        hi: "hola!",
        nickname: "Nickname",
        winphrase: "Frase de Victoria",
        errors: {
            nicknameRequired: "Nickname vacío",
            nicknameMinLength: (len: number)=>{ return (`La Frase de la vitoria debe contener ${len}`)},
            winphraseRequired: "Nickname vacío",
            winphraseMinLength: (len: number)=>{ return (`La Frase de la vitoria debe contener ${len}`)},
        }
    },
    avatar: {
        error: {
            uploadError: "Error en la subida del archivo",
            avatarNotFound: "Avatar no encontrado",
            invalidImageFile: "Archivo de imagen no válido",
            invalidImageFormat: "Formato de imagen no válido",
            unknownError: "Error desconocido",
            tooLarge: "Tamaño de Imagen muy grande",
        }
    },
    serverError: {
        conectionError: "Server conection error",
        notFound: "Ruta no encontrada",
        unknownError: "Unknown Server Error",
    },
    gameMode: {
        title: "Modo de Juego",
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
    language: {
        selectLanguage: "Seleccionar idioma",
        english: "Inglés",
        en: "en",
        spanish: "Español",
        es: "es",
        italian: "Italiano",
        it: "it",
    },
    footer: {
        terms: "Términos de servicio",
        privacy: "Política de privacidad",
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
        termsPage: { 
            title: `Términos y Condiciones: "El Ping-Pong del Destino"`,
            content: `<p>Bienvenido a nuestro proyecto de <strong>Transcendence</strong>. Al entrar en esta web, estás aceptando que tu salud mental es responsabilidad tuya y que, probablemente, algo se va a romper en los próximos 5 minutos.</p>

    <hr>

    <h2>1. Aceptación de los Términos</h2>
    <p>Al hacer clic en el botón de <strong>Login con 42</strong>, vendes tu alma técnica a este servidor. Si el sitio explota, te pedimos amablemente que no abras un <em>issue</em> en GitHub; mejor reza un "Padre Nuestro" a <strong>Norminette</strong> y refresca la página (F5 es tu único amigo aquí).</p>

    <h2>2. Sobre el Juego (Pong)</h2>
    <ul>
        <li><strong>Lag Espiritual:</strong> El lag no es un error, es una "mecánica de dificultad añadida". Si pierdes, es culpa de tu conexión o de los astros, nunca de nuestro código en Django/NestJS.</li>
        <li><strong>Física Cuántica:</strong> La pelota puede atravesar la pala en ocasiones especiales. No es un bug, es un efecto de túnel cuántico implementado para que reflexiones sobre la fragilidad de la realidad.</li>
    </ul>

    <h2>3. El Chat y la Toxicidad</h2>
    <p>Se permite el trashtalk moderado, pero si empiezas a spamear sobre por qué C es mejor que TypeScript o por qué prefieres <code>zsh</code> sobre <code>bash</code>, serás baneado por <strong>insoportable</strong>.</p>

    <h2>4. Privacidad y Datos (GDPR-ish)</h2>
    <p>No sabemos exactamente qué hacemos con tus datos porque todavía estamos intentando entender cómo funciona el <strong>JWT</strong> y las cookies <code>HttpOnly</code>. Tu contraseña está (probablemente) a salvo, pero tu dignidad al perder 10-0 quedará registrada para siempre en nuestra base de datos PostgreSQL.</p>

    <h2>5. Responsabilidad Limitada</h2>
    <p>No nos hacemos responsables de: teclados rotos, café derramado sobre el MacBook de la escuela, o crisis existenciales al ver que el <code>Docker-compose</code> tarda 10 minutos en levantar porque el internet del campus ha decidido morir.</p>
    <p class="highlight">⚠️ Advertencia: Este sitio contiene trazas de JavaScript. El uso prolongado puede causar fatiga visual y ganas de volver a programar en Assembly.</p>

    <h2>6. La Evaluación (El Bocal y Tú)</h2>
    <p>Si eres un evaluador: Todo lo que ves es una <strong>"feature"</strong>. Si encuentras un error de memoria, recuerda que estamos en un entorno web y aquí la memoria es un concepto abstracto y metafísico.</p>

    <blockquote>
        <strong>Nota final:</strong> Este proyecto se autodestruirá si intentas abrirlo en Internet Explorer. Por favor, usa un navegador del siglo XXI.
    </blockquote>

    <hr>
    <p style="text-align: center; font-size: 0.8em;">Hecho con ❤️, sudor y demasiadas latas de RedBull.</p>"`,
        },
        privacy: "Política de privacidad",
        privacyPage: {
            title: "Privacidad (O lo que queda de ella)",
            content: `<p>En este proyecto nos tomamos tu privacidad tan en serio como nos tomamos los <em>leaks</em> de memoria en el proyecto de <code>cub3d</code>: nos asustan, pero a veces ignoramos que están ahí hasta que alguien nos evalúa.</p>

    <hr>

    <h2>1. ¿Qué datos recolectamos?</h2>
    <p>Solo lo estrictamente necesario para que este Frankenstein de código funcione:</p>
    <ul>
        <li><strong>Tu Intra Login:</strong> Para saber a quién culpar en el ranking.</li>
        <li><strong>Tu Avatar:</strong> Para que podamos ver esa foto que te hiciste en la piscina hace dos años.</li>
        <li><strong>Cookies:</strong> No de las que se comen (ojalá), sino de las que mantienen tu sesión abierta para que no tengas que loguearte cada vez que el servidor de NestJS se reinicia solo.</li>
    </ul>

    <h2>2. ¿Para qué usamos tus datos?</h2>
    <p>Principalmente para que el sistema de <strong>Transcendence</strong> no colapse. Usamos tu info para:</p>
    <ul>
        <li>Darte un perfil bonito.</li>
        <li>Enviarte notificaciones de chat que probablemente ignores.</li>
        <li>Hacer que el sistema de Matchmaking intente emparejarte con alguien, aunque termines jugando contra un bot porque no hay nadie más conectado a las 4:00 AM.</li>
    </ul>

    <h2>3. ¿Compartimos tus datos?</h2>
    <p>¿A quién le interesarían? Ni Google ni Facebook quieren saber cuántas veces has perdido al Pong contra un compañero. No vendemos tus datos, principalmente porque no sabemos cómo montar una pasarela de pago sin que el <code>Docker</code> explote.</p>

    <h2>4. Seguridad de la Información</h2>
    <div class="data-box">
        if (data.isSafe()) { <br>
        &nbsp;&nbsp;console.log("Trust me bro"); <br>
        } else { <br>
        &nbsp;&nbsp;console.log("It's a feature, not a bug"); <br>
        }
    </div>
    <p>Implementamos niveles de seguridad que harían llorar a un experto en ciberseguridad, pero que son suficientes para pasar la evaluación de un par. Tus contraseñas (si no usas el OAuth de 42) están hasheadas, porque hasta nosotros tenemos estándares.</p>

    <h2>5. Tus Derechos (GDPR de mercadillo)</h2>
    <p>Tienes derecho a:</p>
    <ul>
        <li><strong>Acceso:</strong> Ver lo que guardamos de ti (Spoiler: es poco).</li>
        <li><strong>Rectificación:</strong> Cambiar tu nombre si te arrepientes de ponerte <em>"PongMaster99"</em>.</li>
        <li><strong>Eliminación:</strong> Borrar tu cuenta. Esto eliminará tus datos de la base de datos, pero el trauma de haber perdido contra nuestro jefe final será permanente.</li>
    </ul>

    <h2>6. Cambios en esta Política</h2>
    <p>Nos reservamos el derecho de cambiar esto cada vez que un evaluador nos diga: <em>"Oye, esto es ilegal"</em>. Te avisaremos con un mensaje en el chat que probablemente se pierda en el scroll.</p>

    <blockquote>
        <p class="warning">Al usar este sitio, aceptas que el desarrollador es un estudiante con falta de sueño y que "privacidad absoluta" es un término romántico, no técnico.</p>
    </blockquote>

    <hr>
    <p style="text-align: center; font-size: 0.8em;">Si has leído hasta aquí, claramente tienes demasiado tiempo libre. Ve a terminar el <code>Inception</code>.</p>`,
        }
    },
    profilePage: {
        title: "Perfil de jugador",
    },
    signInPage: {
        title: "Iniciar sesión",
        noAccountText: "¿No tienes una cuenta?",
        submitButton: "Iniciar sesión",
        passwordForgottenLinkText: "¿Olvidaste tu contraseña?",
        loading: "Cargando...",
    },
    signUpPage: {
        title: "Registrarse",
        hasAccount: "Ya tengo cuenta",
        createAccount: "Crear nueva cuenta",
        currentPassword: "Contaseña Actual",
        passwordLabel: "Contraseña",
        newPasswordLabel: "Nueva contraseña",
        confirmPasswordLabel: "Confirmar contraseña",
        submitButton: "Registrarse",
        submitting: "Registrando...",
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
        goBack: "Volver",
    },
    player: {
        wins: "Victorias",
        losses: "Derrotas",
        winRate: "Tasa de victorias",
        userData: "Datos del Jugador",
    },
    form: {
      errors: {
        emailRequired: 'El email es obligatorio',
        emailMinLength: 'El email debe tener al menos 8 caracteres',
        emailInvalid: 'El formato del email no es válido',
        passwordMinLength: 'La contraseña debe tener al menos 8 caracteres',
        containsLetter: 'Debe contener al menos una letra',
        containsNumber: 'Debe contener al menos un número',
        containsSpecialCharacter: 'Debe contener al menos un carácter especial',
        passwordTooShort: 'La contraseña es demasiado corta',
        confirmPasswordTooShort: 'Confirma tu contraseña',
        passwordsDoNotMatch: 'Las contraseñas no coinciden',
        invalidEmail: 'Email inválido',
        invalidPassword: 'Contraseña inválida',
        invalidCredentials: 'Credenciales inválidas',
        serverError: 'Error del servidor, por favor intenta de nuevo más tarde',
        userNotRegistered: 'Usuario no registrado, por favor regístrate primero',
        accountBlocked: 'Cuenta bloqueada. Contacta soporte.',
        userAlreadyExists: 'El usuario ya existe, por favor inicia sesión',

      },
      emailPlaceholder: 'tu@email.com',
      passwordLabel: 'Contraseña',
      changePassword: "Cambiar contraseña",
      goBackHome: 'Volver al inicio',
      submitting: "Submitting...",
    },
    leaderboard: {
        title: "Tabla de clasificación",
        rank: "Rango",
        player: "Jugador",
    },
    achievements: {
        title: "Logros",
        winAchievements: {
            title: "Logros de Victoria",
            firstWin: "Primera Victoria",
            firstWinDesc: "Gana tu primer juego.",
            win10Games: "Competidor Consistente",
            win10GamesDesc: "Gana 10 juegos.",
            win100Games: "Maestro del Pong",
            win100GamesDesc: "Gana 100 juegos.",
        },
        logAchievements: {
            title: "Logros de Inicio de Sesión",
            firstLogin: "Nuevo Recluta",
            firstLoginDesc: "Inicia sesión por primera vez.",
            login7Days: "Asiduo",
            login7DaysDesc: "Inicia sesión durante 7 días consecutivos.",
            login30Days: "Veterano",
            login30DaysDesc: "Inicia sesión durante 30 días consecutivos.",
        },
        wonGamesAchievements: {
            title: "Logros de Juegos Ganados",
            firsgame: "Novato",
            firsgameDesc: "Gana tu primer juego.",
            win5Games: "Principiante",
            win5GamesDesc: "Gana 5 juegos.",
            win50Games: "Intermedio",
            win50GamesDesc: "Gana 50 juegos.",
            win500Games: "Experto",
            win500GamesDesc: "Gana 500 juegos.",
        },
    },
};



export default es;