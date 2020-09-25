import { checkers_board } from "./checkers_board.js";
/*
 * Copyright (C) 2020 Louis Hobson <louis-hobson@hotmail.co.uk>. All Rights Reserved.
 * 
 * Distributed under MIT licence as a part of experiments into game-playing AI
 * For details, see: https://github.com/louishobson/BoardGames/blob/master/LICENSE
 *
 * checkers.js
 *
 * general JS for playing checkers
 *
 */



/* IMPORTS */



/* import checkers_game.js */
import { checkers_game } from "./checkers_game.js";



/* GLOBALS */



/* the checkers board */
var game = new checkers_game ( document.getElementById ( "checkers-board-anchor" ) );

/* the promise chain for playing the game */
var game_promise;

/* whether the game is waiting on user input */
var waiting_for_user = false;

/* whether a game is active currently */
var is_game_active = false;

/* whether the game should be ended at the next possible moment */
var end_game_when_possible = false;

/* the setup of human/computer players */
var player_setup = "white";

/* the current difficulty (depth of search) of the computer player */
var opponent_difficulty = 10;



/* GAME LOOP */



/* continue_game
 *
 * callback for when it is a new player's turn
 * 
 * player: the player who's turn it is now
 */
async function continue_game ( player )
{
    /* change the text above the board */
    document.getElementById ( "checkers-player-turn" ).innerHTML = ( player ? "White's" : "Black's" ) + " turn";
    document.getElementById ( "checkers-player-turn-extra" ).innerHTML = "";

    /* get the actions for the player */
    let actions = game.get_player_actions ( player );

    /* if player must capture, alter extra text */
    if ( actions.length != 0 && actions [ 0 ].capture_piece != checkers_board.piece_id.empty_cell )
        document.getElementById ( "checkers-player-turn-extra" ).innerHTML = "Player must capture";

    /* await timeout to let board reload */
    await new Promise ( r => setTimeout ( r, 100 ) );
    
    /* if should end game early, do it */
    if ( end_game_when_possible ) { end_of_game ( undefined ); return; }

    /* switch for if user or computer move, and make the player promise to move */
    if ( ( player && player_setup == "black" ) || ( !player && player_setup == "white" ) )
    {
        /* is computer move, so simply promise to do it */
        game_promise = game.promise_computer_move ( player, opponent_difficulty, actions ).then ( continue_game, end_of_game );
    }
    else 
    {
        /* is a player move, so set to be waiting for user */
        waiting_for_user = true;

        /* promise to move, but when done set waiting for user to false */
        game_promise = game.promise_user_move ( player, actions )
            .then ( r => { waiting_for_user = false; return r; } )
            .then ( continue_game, end_of_game );
    }
}



/* end_of_game
 *
 * callback for when a game ends
 * 
 * player: the winning player (or undefined for no winner)
 */
function end_of_game ( player )
{
    /* set end game when possible to false */
    end_game_when_possible = false;

    /* change text above the board */
    document.getElementById ( "checkers-player-turn" ).innerHTML = ( player == undefined ? "Game ended" : ( player ? "White wins" : "Black wins" ) );
    document.getElementById ( "checkers-player-turn-extra" ).innerHTML = "";

    /* change text in stop/start button */
    document.getElementById ( "checkers-control-stopstart" ).innerHTML = "Restart";

    /* enable the player select options */
    document.getElementById ( "checkers-control-player-select" ).disabled = false;

    /* set game to inactive */
    is_game_active = false;
}



/* GAME CONTROL EVENT HANDLERS */



/* event handler for the start/stop button */
function stopstart_handler ( ev )
{
    /* if not a game running, start one */
    if ( !is_game_active )
    {
        /* change the text on the button */
        ev.target.innerHTML = "Stop"; 

        /* disable the player select options */
        document.getElementById ( "checkers-control-player-select" ).disabled = true;

        /* reset the board and render */
        game.reset_board ();
        game.render ();

        /* set the game to active */
        is_game_active = true;

        /* start the game */
        continue_game ( true );
    } else

    /* else if waiting for user, re-render and call end of game */
    if ( waiting_for_user )
    {
        /* re-render to remove dragging ability and call end of game */
        game.render ();
        
        /* call end_of_game */
        end_of_game ( undefined );
    } else

    /* else notify to end game when possible */
    {
        /* set boolean */
        end_game_when_possible = true;

        /* change extra message to show something happened */
        document.getElementById ( "checkers-player-turn-extra" ).innerHTML = "Game will end after this turn...";
    }
}



/* event callback for chosing 1/2 player */
function player_select_handler ( ev )
{
    /* change player_setup */
    player_setup = ev.target.value;

    /* if is two player, disable the difficulty handler, else show it */
    if ( player_setup == "twoplayer" ) 
    {
        document.getElementById ( "checkers-control-oppdifficulty" ).disabled = true;
        document.getElementById ( "checkers-control-oppdifficulty-text" ).innerHTML = "Opponent difficulty: N/A";
    }
    else 
    {
        document.getElementById ( "checkers-control-oppdifficulty" ).disabled = false;
        document.getElementById ( "checkers-control-oppdifficulty-text" ).innerHTML = "Opponent difficulty: " + opponent_difficulty;
    }
}



/* event handler for moving the opponent difficulty slider */
function opponent_difficulty_handler ( ev )
{
    /* change the value of the difficulty */
    opponent_difficulty = ev.target.value;

    /* change the text which shows the difficulty */
    document.getElementById ( "checkers-control-oppdifficulty-text" ).innerHTML = "Opponent difficulty: " + opponent_difficulty;
}



/* SETTING EVENT HANDLERS */



/* set event handlers */
document.getElementById ( "checkers-control-stopstart" ).onclick = stopstart_handler;
document.getElementById ( "checkers-control-player-select" ).onchange = player_select_handler;
document.getElementById ( "checkers-control-oppdifficulty" ).onchange = opponent_difficulty_handler;
document.getElementById ( "checkers-control-oppdifficulty" ).oninput = opponent_difficulty_handler;