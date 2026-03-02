const en = {
    homePage: {
        title: "SkyPong",
        welcome: "Welcome to the sky of Pong",
        description: "A celestial Pong experience",
        lable: "Go to Home",
    },
    hero: {
        howToPlay: "How to play?",
    },
    user: {
        hi: "Hi!",
        nickname: "Nickname",
        winphrase: "Win Phrase",
        deleteBtn: "Delete Account",
        deleteAccountWarning: "This will remove permanently your account. This acction is irreverible. Ate you sure?",
        errors: {
            nicknameRequired: "Nickname vacío",
            nicknameMinLength: (len: number)=>{ return (`La Frase de la vitoria debe contener ${len}`)},
            winphraseRequired: "Nickname vacío",
            winphraseMinLength: (len: number)=>{ return (`La Frase de la vitoria debe contener ${len}`)},
        }
    },
    avatar: {
        error: {
            uploadError: "Error in image upload",
            avatarNotFound: "Avatar not found",
            invalidImageFile: "Invalid image file",
            invalidImageFormat: "Invalid image format",
            unknownError: "Unknown error",
            tooLarge: "Image file too large",
        }
    },
    serverError: {
        conectionError: "Server conection error",
        notFound: "Ruta no encontrada",
        unknownError: "Unknown Server Error",
    },
    gameMode: {
        title: "Game Mode",
        cta: "Want to play remotely? Log in to access online multiplayer mode.",
        chooseMode: "Choose your game mode",
        local: {
            title: "1 vs 1 Local",
            description: "Play against a friend on the same device.",
        },
        ai: {
            title: "1 vs AI",
            description: "Play against the computer.",
        },
        remote: {
            title: "Online Multiplayer",
            description: "Compete against players from all over the world.",
        },
    },
    language: {
        selectLanguage: "Select language",
        english: "English",
        en: "en",
        spanish: "Spanish",
        es: "es",
        italian: "Italian",
        it: "it",
    },
    footer: {
        terms: "Terms of Service",
        privacy: "Privacy Policy",
    },
    game: {
        score: "Score",
        pause: "Pause",
        resume: "Resume",
        quit: "Quit",
        playButton: "Play",
    },
    legal: {
        terms: "Terms of Service",
        termsPage: {
            title: `Terms and Conditions: "The Ping-Pong of Destiny"`,
            content: `<p>Welcome to our <strong>Transcendence</strong> project. By entering this website, you agree that your mental health is your own responsibility and that something will probably break within the next 5 minutes.</p>

<hr>

<h2>1. Acceptance of the Terms</h2>
<p>By clicking the <strong>Login with 42</strong> button, you sell your technical soul to this server. If the site explodes, we kindly ask you not to open a GitHub <em>issue</em>; instead, pray a "Our Father" to <strong>Norminette</strong> and refresh the page (F5 is your only true friend here).</p>

<h2>2. About the Game (Pong)</h2>
<ul>
    <li><strong>Spiritual Lag:</strong> Lag is not a bug, it’s an "extra difficulty mechanic". If you lose, it’s your connection’s fault or the stars — never our Django/NestJS code.</li>
    <li><strong>Quantum Physics:</strong> The ball may pass through the paddle on special occasions. It’s not a bug; it’s a quantum tunneling effect designed to make you reflect on the fragility of reality.</li>
</ul>

<h2>3. Chat and Toxicity</h2>
<p>Moderate trash talk is allowed, but if you start spamming about why C is better than TypeScript or why you prefer <code>zsh</code> over <code>bash</code>, you will be banned for being <strong>unbearable</strong>.</p>

<h2>4. Privacy and Data (GDPR-ish)</h2>
<p>We don’t exactly know what we do with your data yet because we’re still trying to understand how <strong>JWT</strong> and <code>HttpOnly</code> cookies work. Your password is (probably) safe, but your dignity after losing 10–0 will be permanently stored in our PostgreSQL database.</p>

<h2>5. Limited Liability</h2>
<p>We are not responsible for: broken keyboards, coffee spilled on the school MacBook, or existential crises caused by <code>docker-compose</code> taking 10 minutes to start because the campus internet decided to die.</p>
<p class="highlight">⚠️ Warning: This site contains traces of JavaScript. Prolonged use may cause eye strain and the urge to go back to programming in Assembly.</p>

<h2>6. The Evaluation (The Bocal and You)</h2>
<p>If you are an evaluator: everything you see is a <strong>"feature"</strong>. If you find a memory error, remember that this is a web environment and memory is a metaphysical concept here.</p>

<blockquote>
    <strong>Final note:</strong> This project will self-destruct if opened in Internet Explorer. Please use a 21st-century browser.
</blockquote>

<hr>
<p style="text-align: center; font-size: 0.8em;">Made with ❤️, sweat, and way too many cans of Red Bull.</p>`,
        },
        privacy: "Privacy Policy",
        privacyPage: {
            title: "Privacy (Or What’s Left of It)",
            content: `<p>In this project, we take your privacy as seriously as we take memory leaks in the <code>cub3d</code> project: they scare us, but sometimes we ignore them until someone evaluates us.</p>

<hr>

<h2>1. What data do we collect?</h2>
<p>Only what’s strictly necessary for this Frankenstein of a project to work:</p>
<ul>
    <li><strong>Your Intra Login:</strong> So we know who to blame in the rankings.</li>
    <li><strong>Your Avatar:</strong> So we can see that pool picture you took two years ago.</li>
    <li><strong>Cookies:</strong> Not the edible ones (sadly), but the ones that keep your session alive so you don’t have to log in every time the NestJS server restarts itself.</li>
</ul>

<h2>2. What do we use your data for?</h2>
<p>Mainly to keep the <strong>Transcendence</strong> system from collapsing. We use your info to:</p>
<ul>
    <li>Give you a nice-looking profile.</li>
    <li>Send you chat notifications that you will probably ignore.</li>
    <li>Make the matchmaking system try to pair you with someone, even if you end up playing against a bot because no one else is online at 4:00 AM.</li>
</ul>

<h2>3. Do we share your data?</h2>
<p>Who would even want it? Neither Google nor Facebook care how many times you’ve lost at Pong against a teammate. We don’t sell your data, mainly because we don’t know how to set up a payment gateway without <code>Docker</code> exploding.</p>

<h2>4. Information Security</h2>
<div class="data-box">
    if (data.isSafe()) { <br>
    &nbsp;&nbsp;console.log("Trust me bro"); <br>
    } else { <br>
    &nbsp;&nbsp;console.log("It's a feature, not a bug"); <br>
    }
</div>
<p>We implement security levels that would make a cybersecurity expert cry, but they are good enough to pass a peer evaluation. Your passwords (if you don’t use 42 OAuth) are hashed, because even we have standards.</p>

<h2>5. Your Rights (Budget GDPR)</h2>
<p>You have the right to:</p>
<ul>
    <li><strong>Access:</strong> See what we store about you (Spoiler: not much).</li>
    <li><strong>Rectification:</strong> Change your name if you regret choosing <em>"PongMaster99"</em>.</li>
    <li><strong>Deletion:</strong> Delete your account. This will remove your data from the database, but the trauma of losing to our final boss will remain forever.</li>
</ul>

<h2>6. Changes to This Policy</h2>
<p>We reserve the right to change this every time an evaluator tells us: <em>"Hey, this is illegal"</em>. We’ll notify you with a chat message that will probably get lost in the scroll.</p>

<blockquote>
    <p class="warning">By using this site, you accept that the developer is a sleep-deprived student and that "absolute privacy" is a romantic concept, not a technical one.</p>
</blockquote>

<hr>
<p style="text-align: center; font-size: 0.8em;">If you’ve read this far, you clearly have too much free time. Go finish <code>Inception</code>.</p>`,
        },
    },
    profilePage: {
        title: "Player Profile",
    },
    signInPage: {
        title: "Sign In",
        noAccountText: "Don't have an account?",
        submitButton: "Sign In",
        passwordForgottenLinkText: "Forgot your password?",
        loading: "Loading...",
    },
    signUpPage: {
        title: "Sign Up",
        hasAccount: "Already have an account", 
        createAccount: "Create new account",
        currentPassword: "Current Password",
        passwordLabel: "Password",
        newPasswordLabel: "New Password",
        confirmPasswordLabel: "Confirm password",
        submitButton: "Sign Up",
        submitting: "Signing up...",
    },
    remoteRoomLobbyPage: {
        title: "Multiplayer Lobby",
        waitingMessage: "Waiting for other players to join...",
        startButton: "Start game",
    },
    navigation: {
        home: "Home",
        profile: "Profile",
        logout: "Log out",
        goBack: "Go back",
    },
    player: {
        wins: "Wins",
        losses: "Losses",
        winRate: "Win rate",
        userData: "Datos del Jugador",
    },
    form: {
    errors: {
        emailRequired: 'Email is required',
        emailMinLength: 'Email must be at least 8 characters long',
        emailInvalid: 'The email format is not valid',
        passwordMinLength: 'Password must be at least 8 characters long',
        containsLetter: 'Must contain at least one letter',
        containsNumber: 'Must contain at least one number',
        containsSpecialCharacter: 'Must contain at least one special character',
        passwordTooShort: 'The password is too short',
        confirmPasswordTooShort: 'Confirm your password',
        passwordsDoNotMatch: 'Passwords do not match',
        invalidEmail: 'Invalid email',
        invalidPassword: 'Invalid password',
        serverError: 'An error occurred while logging in. Please try again later.',
        userNotRegistered: 'User not registered',
        invalidCredentials: 'Invalid credentials',
        accountBlocked: 'Account blocked. Contact support.',
        userAlreadyExists: 'User already exists',
    },
    emailPlaceholder: 'your@email.com',
    passwordLabel: 'Password',
    changePassword: "Cambiar contraseña",
    goBackHome: 'Back to home',
    submitting: "Submitting...",
    },
    leaderboard: {
        title: "Leaderboard",
        rank: "Rank",
        player: "Player",
    },
    achievements: {
        title: "Achievements",
        winAchievements: {
            title: "Win Achievements",
            firstWin: "First Win",
            firstWinDesc: "Win your first game.",
            win10Games: "Consistent Competitor",
            win10GamesDesc: "Win 10 games.",
            win100Games: "Pong Master",
            win100GamesDesc: "Win 100 games.",
        },
        logAchievements: {
            title: "Login Achievements",
            firstLogin: "New Recruit",
            firstLoginDesc: "Log in for the first time.",
            login7Days: "Regular",
            login7DaysDesc: "Log in for 7 consecutive days.",
            login30Days: "Veteran",
            login30DaysDesc: "Log in for 30 consecutive days.",
        },
        wonGamesAchievements: {
            title: "Games Won Achievements",
            firsgame: "Rookie",
            firsgameDesc: "Win your first game.",
            win5Games: "Beginner",
            win5GamesDesc: "Win 5 games.",
            win50Games: "Intermediate",
            win50GamesDesc: "Win 50 games.",
            win500Games: "Expert",
            win500GamesDesc: "Win 500 games.",
        },
    },
};

export default en;
