var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Schema, type } from "@colyseus/schema";
import { SCORING } from "./constants/ScoringConstants.js";
export class BallState extends Schema {
    constructor() {
        super(...arguments);
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.timestamp = 0;
        this.enabled = true;
        // New fields for collision handling (used for both paddle and border collisions)
        this.lastImpactX = 0;
        this.lastImpactZ = 0;
        this.collisionCount = 0;
        this.collisionTime = 0; // Server timestamp when collision occurred
    }
}
__decorate([
    type("number"),
    __metadata("design:type", Number)
], BallState.prototype, "x", void 0);
__decorate([
    type("number"),
    __metadata("design:type", Number)
], BallState.prototype, "y", void 0);
__decorate([
    type("number"),
    __metadata("design:type", Number)
], BallState.prototype, "z", void 0);
__decorate([
    type("number"),
    __metadata("design:type", Number)
], BallState.prototype, "timestamp", void 0);
__decorate([
    type("boolean"),
    __metadata("design:type", Boolean)
], BallState.prototype, "enabled", void 0);
__decorate([
    type("number"),
    __metadata("design:type", Number)
], BallState.prototype, "lastImpactX", void 0);
__decorate([
    type("number"),
    __metadata("design:type", Number)
], BallState.prototype, "lastImpactZ", void 0);
__decorate([
    type("number"),
    __metadata("design:type", Number)
], BallState.prototype, "collisionCount", void 0);
__decorate([
    type("number"),
    __metadata("design:type", Number)
], BallState.prototype, "collisionTime", void 0);
export class PaddleState extends Schema {
    constructor() {
        super(...arguments);
        this.x = 0;
        this.z = 0;
        this.y = 0;
        this.enabled = true;
    }
}
__decorate([
    type("number"),
    __metadata("design:type", Number)
], PaddleState.prototype, "x", void 0);
__decorate([
    type("number"),
    __metadata("design:type", Number)
], PaddleState.prototype, "z", void 0);
__decorate([
    type("number"),
    __metadata("design:type", Number)
], PaddleState.prototype, "y", void 0);
__decorate([
    type("boolean"),
    __metadata("design:type", Boolean)
], PaddleState.prototype, "enabled", void 0);
export class MyGameState extends Schema {
    constructor() {
        super(...arguments);
        // Ball and paddles
        this.ball = new BallState();
        this.paddle = new PaddleState();
        this.paddle2 = new PaddleState();
        // Player identification
        this.player1Id = "";
        this.player2Id = "";
        this.player1Name = "Player 1";
        this.player2Name = "Player 2";
        this.player1Color = "#00A6ED";
        this.player2Color = "#F6511D";
        // Scoring
        this.player1Score = 0;
        this.player2Score = 0;
        this.winningScore = SCORING.DEFAULT_WINNING_SCORE;
        // Game state
        this.winner = ""; // SessionId of winner, empty if no winner
        this.gameOver = false;
        this.gameStarted = false;
        // Client readiness (for loading sync in PvP)
        this.player1Ready = false;
        this.player2Ready = false;
        // Player 2 joined flag (to know when both player colors are set)
        this.player2Joined = false;
    }
}
__decorate([
    type(BallState),
    __metadata("design:type", Object)
], MyGameState.prototype, "ball", void 0);
__decorate([
    type(PaddleState),
    __metadata("design:type", Object)
], MyGameState.prototype, "paddle", void 0);
__decorate([
    type(PaddleState),
    __metadata("design:type", Object)
], MyGameState.prototype, "paddle2", void 0);
__decorate([
    type("string"),
    __metadata("design:type", String)
], MyGameState.prototype, "player1Id", void 0);
__decorate([
    type("string"),
    __metadata("design:type", String)
], MyGameState.prototype, "player2Id", void 0);
__decorate([
    type("string"),
    __metadata("design:type", String)
], MyGameState.prototype, "player1Name", void 0);
__decorate([
    type("string"),
    __metadata("design:type", String)
], MyGameState.prototype, "player2Name", void 0);
__decorate([
    type("string"),
    __metadata("design:type", String)
], MyGameState.prototype, "player1Color", void 0);
__decorate([
    type("string"),
    __metadata("design:type", String)
], MyGameState.prototype, "player2Color", void 0);
__decorate([
    type("number"),
    __metadata("design:type", Number)
], MyGameState.prototype, "player1Score", void 0);
__decorate([
    type("number"),
    __metadata("design:type", Number)
], MyGameState.prototype, "player2Score", void 0);
__decorate([
    type("number"),
    __metadata("design:type", Number)
], MyGameState.prototype, "winningScore", void 0);
__decorate([
    type("string"),
    __metadata("design:type", String)
], MyGameState.prototype, "winner", void 0);
__decorate([
    type("boolean"),
    __metadata("design:type", Boolean)
], MyGameState.prototype, "gameOver", void 0);
__decorate([
    type("boolean"),
    __metadata("design:type", Boolean)
], MyGameState.prototype, "gameStarted", void 0);
__decorate([
    type("boolean"),
    __metadata("design:type", Boolean)
], MyGameState.prototype, "player1Ready", void 0);
__decorate([
    type("boolean"),
    __metadata("design:type", Boolean)
], MyGameState.prototype, "player2Ready", void 0);
__decorate([
    type("boolean"),
    __metadata("design:type", Boolean)
], MyGameState.prototype, "player2Joined", void 0);
