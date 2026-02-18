const it = {
    homePage: {
        title: "SkyPong",
        welcome: "Benvenuto nel cielo del Pong",
        description: "Un'esperienza celestiale di Pong",
        lable: "Vai alla Home",
    },
    user: {
        hi: "Ciao!",
    },
    avatar: {
        error: {
            uploadError: "Error en la subida del archivo",
            avatarNotFound: "Avatar no encontrado",
            invalidImageFile: "Archivo de imagen no válido",
            invalidImageFormat: "Formato de imagen no válido",
            unknownError: "Unknown error",
            tooLarge: "Image file too large",
        }
    },
    serverError: {
        conectionError: "Server conection error",
    },
    gameMode: {
        title: "Modalità di gioco",
        cta: "Vuoi giocare da remoto? Accedi per accedere alla modalità multigiocatore online.",
        chooseMode: "Scegli la modalità di gioco",
        local: {
            title: "1 vs 1 Locale",
            description: "Gioca contro un amico sullo stesso dispositivo.",
        },
        ai: {
            title: "1 vs IA",
            description: "Gioca contro il computer.",
        },
        remote: {
            title: "Multigiocatore online",
            description: "Competi contro giocatori di tutto il mondo.",
        },
    },
    language: {
        selectLanguage: "Seleziona lingua",
        english: "Inglese",
        locen: "en",
        spanish: "Spagnolo",
        loces: "es",
        italian: "Italiano",
        locit: "it",
    },
    footer: {
        terms: "Termini di servizio",
        privacy: "Informativa sulla privacy",
    },
    game: {
        score: "Punteggio",
        pause: "Pausa",
        resume: "Riprendi",
        quit: "Esci",
        playButton: "Gioca",
    },
    legal: {
        terms: "Termini di servizio",
        termsPage: {
            title: `Termini e Condizioni: "Il Ping-Pong del Destino"`,
            content: `<p>Benvenuto nel nostro progetto <strong>Transcendence</strong>. Accedendo a questo sito, accetti che la tua salute mentale sia una tua responsabilità e che qualcosa probabilmente si romperà entro i prossimi 5 minuti.</p>

<hr>

<h2>1. Accettazione dei Termini</h2>
<p>Cliccando sul pulsante <strong>Login con 42</strong>, vendi la tua anima tecnica a questo server. Se il sito esplode, ti chiediamo gentilmente di non aprire una <em>issue</em> su GitHub; piuttosto recita un "Padre Nostro" a <strong>Norminette</strong> e aggiorna la pagina (F5 è il tuo unico vero amico).</p>

<h2>2. Sul Gioco (Pong)</h2>
<ul>
    <li><strong>Latenza Spirituale:</strong> Il lag non è un bug, è una "meccanica di difficoltà aggiuntiva". Se perdi, è colpa della tua connessione o degli astri, mai del nostro codice Django/NestJS.</li>
    <li><strong>Fisica Quantistica:</strong> In alcune occasioni speciali la pallina può attraversare la racchetta. Non è un bug, è un effetto di tunnel quantistico pensato per farti riflettere sulla fragilità della realtà.</li>
</ul>

<h2>3. Chat e Tossicità</h2>
<p>Il trash talk moderato è consentito, ma se inizi a spammare su perché C è migliore di TypeScript o perché preferisci <code>zsh</code> a <code>bash</code>, verrai bannato per essere <strong>insopportabile</strong>.</p>

<h2>4. Privacy e Dati (GDPR-ish)</h2>
<p>Non sappiamo esattamente cosa facciamo con i tuoi dati perché stiamo ancora cercando di capire come funzionano <strong>JWT</strong> e i cookie <code>HttpOnly</code>. La tua password è (probabilmente) al sicuro, ma la tua dignità dopo una sconfitta 10–0 resterà per sempre nel nostro database PostgreSQL.</p>

<h2>5. Responsabilità Limitata</h2>
<p>Non siamo responsabili per: tastiere rotte, caffè rovesciato sul MacBook della scuola o crisi esistenziali causate da <code>docker-compose</code> che impiega 10 minuti ad avviarsi perché internet del campus ha deciso di morire.</p>
<p class="highlight">⚠️ Avviso: Questo sito contiene tracce di JavaScript. L’uso prolungato può causare affaticamento visivo e il desiderio di tornare a programmare in Assembly.</p>

<h2>6. La Valutazione (Il Bocal e Tu)</h2>
<p>Se sei un valutatore: tutto ciò che vedi è una <strong>"feature"</strong>. Se trovi un errore di memoria, ricorda che siamo in un ambiente web e qui la memoria è un concetto metafisico.</p>

<blockquote>
    <strong>Nota finale:</strong> Questo progetto si autodistruggerà se aperto con Internet Explorer. Usa un browser del XXI secolo.
</blockquote>

<hr>
<p style="text-align: center; font-size: 0.8em;">Realizzato con ❤️, sudore e troppe lattine di Red Bull.</p>`,
        },
        privacy: "Informativa sulla privacy",
        privacyPage: {
            title: "Privacy (O quel che ne resta)",
            content: `<p>In questo progetto prendiamo la tua privacy sul serio quanto prendiamo i <em>memory leak</em> nel progetto <code>cub3d</code>: ci spaventano, ma a volte li ignoriamo finché qualcuno non ci valuta.</p>

<hr>

<h2>1. Quali dati raccogliamo?</h2>
<p>Solo lo stretto necessario affinché questo Frankenstein di progetto funzioni:</p>
<ul>
    <li><strong>Il tuo login Intra:</strong> Per sapere chi incolpare nella classifica.</li>
    <li><strong>Il tuo avatar:</strong> Per poter vedere quella foto in piscina che hai fatto due anni fa.</li>
    <li><strong>Cookie:</strong> Non quelli da mangiare (purtroppo), ma quelli che mantengono attiva la sessione così non devi fare login ogni volta che il server NestJS si riavvia da solo.</li>
</ul>

<h2>2. Per cosa usiamo i tuoi dati?</h2>
<p>Principalmente per evitare che il sistema <strong>Transcendence</strong> collassi. Usiamo le tue informazioni per:</p>
<ul>
    <li>Darti un profilo carino.</li>
    <li>Inviarti notifiche di chat che probabilmente ignorerai.</li>
    <li>Fare in modo che il matchmaking provi ad accoppiarti con qualcuno, anche se finirai per giocare contro un bot perché non c’è nessun altro online alle 4:00 del mattino.</li>
</ul>

<h2>3. Condividiamo i tuoi dati?</h2>
<p>A chi dovrebbero interessare? Né Google né Facebook vogliono sapere quante volte hai perso a Pong contro un compagno. Non vendiamo i tuoi dati, soprattutto perché non sappiamo come configurare un sistema di pagamento senza far esplodere <code>Docker</code>.</p>

<h2>4. Sicurezza delle Informazioni</h2>
<div class="data-box">
    if (data.isSafe()) { <br>
    &nbsp;&nbsp;console.log("Trust me bro"); <br>
    } else { <br>
    &nbsp;&nbsp;console.log("It's a feature, not a bug"); <br>
    }
</div>
<p>Implementiamo livelli di sicurezza che farebbero piangere un esperto di cybersecurity, ma sono sufficienti per superare una valutazione tra pari. Le tue password (se non usi l’OAuth di 42) sono hashate, perché anche noi abbiamo degli standard.</p>

<h2>5. I tuoi diritti (GDPR da bancarella)</h2>
<p>Hai il diritto di:</p>
<ul>
    <li><strong>Accesso:</strong> Vedere cosa conserviamo su di te (Spoiler: poco).</li>
    <li><strong>Rettifica:</strong> Cambiare nome se ti penti di aver scelto <em>"PongMaster99"</em>.</li>
    <li><strong>Cancellazione:</strong> Eliminare il tuo account. Questo rimuoverà i tuoi dati dal database, ma il trauma di aver perso contro il boss finale resterà per sempre.</li>
</ul>

<h2>6. Modifiche a questa Informativa</h2>
<p>Ci riserviamo il diritto di cambiare questo documento ogni volta che un valutatore ci dice: <em>"Ehi, questo è illegale"</em>. Ti avviseremo con un messaggio in chat che probabilmente si perderà nello scroll.</p>

<blockquote>
    <p class="warning">Utilizzando questo sito, accetti che lo sviluppatore sia uno studente privato del sonno e che la "privacy assoluta" sia un concetto romantico, non tecnico.</p>
</blockquote>

<hr>
<p style="text-align: center; font-size: 0.8em;">Se hai letto fino a qui, hai decisamente troppo tempo libero. Vai a finire <code>Inception</code>.</p>`,
        },
    },
    profilePage: {
        title: "Profilo giocatore",
    },
    signInPage: {
        title: "Accedi",
        noAccountText: "Non hai un account?",
        
        submitButton: "Accedi",
        passwordForgottenLinkText: "Password dimenticata?",
        loading: "Caricando...",
    },
    signUpPage: {
        title: "Registrati",
        hasAccount: "Hai già un account?",
        createAccount: "Crea nuovo account",
        passwordLabel: "Password",
        newPasswordLabel: "Nuova password",
        confirmPasswordLabel: "Conferma password",
        submitButton: "Registrati",
        submitting: "Registrando...",
    },
    remoteRoomLobbyPage: {
        title: "Lobby multigiocatore",
        waitingMessage: "In attesa che altri giocatori si uniscano...",
        startButton: "Avvia partita",
    },
    navigation: {
        home: "Home",
        profile: "Profilo",
        logout: "Disconnetti",
        goBack: "Indietro",
    },
    player: {
        wins: "Vittorie",
        losses: "Sconfitte",
        winRate: "Percentuale di vittorie",
    },
    form: {
    errors: {
        emailRequired: "L'email è obbligatoria",
        emailMinLength: "L'email deve contenere almeno 8 caratteri",
        emailInvalid: "Il formato dell'email non è valido",
        passwordMinLength: 'La password deve contenere almeno 8 caratteri',
        containsLetter: 'Deve contenere almeno una lettera',
        containsNumber: 'Deve contenere almeno un numero',
        containsSpecialCharacter: 'Deve contenere almeno un carattere speciale',
        passwordTooShort: 'La password è troppo corta',
        confirmPasswordTooShort: 'Conferma la password',
        passwordsDoNotMatch: 'Le password non coincidono',
        invalidEmail: 'Email non valida',
        invalidPassword: 'Password non valida',
        serverError: 'Si è verificato un errore durante l\'accesso. Riprova più tardi.',
        userNotRegistered: 'Utente non registrato',
        invalidCredentials: 'Credenziali non valide',
        accountBlocked: 'Account bloccato. Contatta il supporto.',
        userAlreadyExists: 'Utente già esistente',
    },
    emailPlaceholder: 'tu@email.com',
    passwordLabel: 'Password',
    goBackHome: 'Torna alla home',
    },
    leaderboard: {
        title: "Classifica",
        rank: "Posizione",
        player: "Giocatore",
    },
    achievements: {
        title: "Obiettivi",
        winAchievements: {
            title: "Obiettivi di Vittoria",
            firstWin: "Prima Vittoria",
            firstWinDesc: "Vinci la tua prima partita.",
            win10Games: "Competitore Costante",
            win10GamesDesc: "Vinci 10 partite.",
            win100Games: "Maestro del Pong",
            win100GamesDesc: "Vinci 100 partite.",
        },
        logAchievements: {
            title: "Obiettivi di Accesso",
            firstLogin: "Nuova Recluta",
            firstLoginDesc: "Accedi per la prima volta.",
            login7Days: "Assiduo",
            login7DaysDesc: "Accedi per 7 giorni consecutivi.",
            login30Days: "Veterano",
            login30DaysDesc: "Accedi per 30 giorni consecutivi.",
        },
        wonGamesAchievements: {
            title: "Obiettivi di Partite Vinte",
            firsgame: "Novizio",
            firsgameDesc: "Vinci la tua prima partita.",
            win5Games: "Principiante",
            win5GamesDesc: "Vinci 5 partite.",
            win50Games: "Intermedio",
            win50GamesDesc: "Vinci 50 partite.",
            win500Games: "Esperto",
            win500GamesDesc: "Vinci 500 partite.",
        },
    },
};

export default it;
