import { NgModule } from "@angular/core";
import { ChessBoardComponent } from "../modules/chess-board/chess-board.component";
import { ComputerModeComponent } from "../modules/computer-mode/computer-mode.component";
import { RouterModule, Routes } from "@angular/router";

const routes: Routes = [
    {path: "against-friend", component: ChessBoardComponent, title: "Play Against Friend"}, 
    {path: "against-computer", component: ComputerModeComponent, title: "Play Against Computer"}
]

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule{}