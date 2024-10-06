import { Component } from '@angular/core';
import { ChessBoard } from 'src/app/chess-logic/chess-board';
import { Color, FENChar } from 'src/app/chess-logic/pieces/models';

@Component({
  selector: 'app-chess-board',
  templateUrl: './chess-board.component.html',
  styleUrls: ['./chess-board.component.css']
})
export class ChessBoardComponent {
  private chessBoard = new ChessBoard();
  public chessBoardView: (FENChar | null)[][] = this.chessBoard.chessBoardView;
  public get playerColor(): Color {return this.chessBoard.playerColor; };
}
