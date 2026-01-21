// There are this 3 locales available: 'en', 'es', 'it'

import achivements from "../achivements/achivements";

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
        achievements: [achivements[0], achivements[3], achivements[6]],
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
        achievements: [achivements[1], achivements[4], achivements[7]],
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
        achievements: [achivements[2], achivements[5]],
    },
];