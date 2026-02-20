// export interface IGameStats {
//     readonly player1Name: string;
//     readonly scorePlayer1: number;
// }

import { start } from "repl";


export class GameStats {

    private player1Id: string;
    private player2Id: string;
    private player1Name: string;
    private player2Name: string;
    private player1Score: number;
    private player2Score: number;
    private startAt: string;
    private endAt: string;
    private gameId: string; // INFO for now it matches the Colyseus generated roomId
    // TODO get playerIds from frontend
    // TODO say who is winner in object

    constructor(gameId: string, startAt: string, endAt: string, player1Id: string, player1Name: string, player2Id: string, player2Name: string, player1Score: number, player2Score: number) {
        this.gameId = gameId;
        this.startAt = startAt;
        this.endAt = endAt;
        this.player1Id = player1Id;
        this.player2Id = player2Id;
        this.player1Name = player1Name;
        this.player2Name = player2Name;
        this.player1Score = player1Score;
        this.player2Score = player2Score;
    }

    setPlayer1Id(id: string): void {
        this.player1Id = id;
    }

    setPlayer2Id(id: string): void {
        this.player2Id = id;
    }

    setPlayer1Name(name: string): void {
        this.player1Name = name;
    }

    setPlayer2Name(name: string): void {
        this.player2Name = name;
    }

    setScore(player1Score: number, player2Score: number): void {
        this.player1Score = player1Score;
        this.player2Score = player2Score;
    }

    setEndAt(endAt: string) {
        this.endAt = endAt;
    }

    toObject() {
        return {
            start_at: this.startAt,
            end_at: this.endAt,
            gameId: this.gameId,
            player1Id: this.player1Id,
            player2Id: this.player2Id,
            player1Name: this.player1Name,
            player2Name: this.player2Name,
            player1Score: this.player1Score,
            player2Score: this.player2Score,
        };
    }
}