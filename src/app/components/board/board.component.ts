import { CommonModule } from '@angular/common';
import { Component, QueryList, ViewChildren, ElementRef } from '@angular/core';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css'],
})
export class BoardComponent {
  board: any[][] = [];
  currentPlayer: number = 1;
  chainReactionInProgress: boolean = false;
  firstMove: boolean = true;
  gameOver: boolean = false;

  @ViewChildren('cell') cellElements!: QueryList<ElementRef>;

  constructor() {
    this.initializeBoard();
  }

  initializeBoard() {
    this.firstMove = true;
    this.gameOver = false;
    this.board = Array.from({ length: 6 }, () =>
      Array.from({ length: 6 }, () => ({ orbs: 0, player: null }))
    );
  }

  handleClick(row: number, col: number) {
    if (this.board[row][col].player === this.currentPlayer || this.board[row][col].player === null) {
      this.placeOrb(row, col);
      this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
      if (!this.firstMove) {
        this.firstMove = false;
        this.checkGameOver();
      }
    }
  }

  placeOrb(row: number, col: number) {
    this.board[row][col] = { ...this.board[row][col], orbs: this.board[row][col].orbs + 1, player: this.currentPlayer };

    if (this.board[row][col].orbs >= this.getThreshold(row, col)) {
      this.chainReactionInProgress = true;
      this.triggerChainReaction(row, col);
    }
  }

  triggerChainReaction(row: number, col: number) {
    this.board[row][col] = { orbs: 0, player: null };

    const directions = [
      [0, 1], [1, 0], [0, -1], [-1, 0]
    ];

    for (const [dx, dy] of directions) {
      const newRow = row + dx;
      const newCol = col + dy;

      if (this.isValidCell(newRow, newCol)) {
        this.placeOrb(newRow, newCol);
      }
    }

    this.chainReactionInProgress = false;
    this.checkGameOver();
  }

  getThreshold(row: number, col: number): number {
    let threshold = 4;
    if (row === 0 || row === 5) threshold--;
    if (col === 0 || col === 5) threshold--;
    return threshold;
  }

  isValidCell(row: number, col: number): boolean {
    return row >= 0 && row < 6 && col >= 0 && col < 6;
  }

  checkGameOver() {
    if (this.chainReactionInProgress || this.gameOver) return;

    const players = new Set(this.board.flat().map(cell => cell.player).filter(player => player !== null));
    console.log('Players set:', players);
    console.log('Board state:', this.board);

    if (players.size === 1 && this.board.flat().some(cell => cell.player !== null)) {
      this.gameOver = true;
      alert(`Player ${Array.from(players)[0]} wins!`);
      this.initializeBoard();
    }
  }
}