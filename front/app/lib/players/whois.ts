export function whoisURL(playerId: string, userId: string): string {
    return userId === playerId ? '/me' : `/${playerId}`;
}

export function isMe(playerId: string, userId: string): boolean {
    return userId === playerId;
}