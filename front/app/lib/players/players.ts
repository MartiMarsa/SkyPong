// There are this 3 locales available: 'en', 'es', 'it'

export const players = [
    {
        id: 1,
        info: {
            avatarUrl: 'https://picsum.photos/200',
            nickname: 'PlayerOne',
            fullname: 'Alice Smith',
            winphrase: 'Victory is mine!',
        },
        stats: {
            wins: 25,
            losses: 5,
        },
        locale: 'en-US',
    },
    {
        id: 2,
        info: {
            avatarUrl: 'https://picsum.photos/200',
            nickname: 'GamerGirl',
            fullname: 'Bob Johnson',
            winphrase: 'You can\'t beat me!',
        },
        stats: {
            wins: 15,
            losses: 10,
        },
        locale: 'es-ES',
    },
    {
        id: 3,
        info: {
            avatarUrl: 'https://picsum.photos/200',
            nickname: 'NoobMaster',
            fullname: 'Charlie Brown',
            winphrase: 'I\'m just getting started!',
        },
        stats: {
            wins: 5,
            losses: 20,
        },
        locale: 'it-IT',
    },
];