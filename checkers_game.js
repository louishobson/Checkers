/*
 * Copyright (C) 2020 Louis Hobson <louis-hobson@hotmail.co.uk>. All Rights Reserved.
 * 
 * Distributed under MIT licence as a part of experiments into game-playing AI
 * For details, see: https://github.com/louishobson/BoardGames/blob/master/LICENSE
 *
 * checkers_game.js
 *
 * class for checkers game
 *
 */



/* import checkers_board.js */
import { checkers_board } from "./checkers_board.js";



/* checkers_game
 *
 * extension of checkers_board to add game mechanics
 */
export class checkers_game extends checkers_board
{

    /* MEMBERS */


    
    /* resolve and reject functions for user move promises */
    user_move_resolve;
    user_move_reject;



    /* CONSTRUCTOR */



    /* constructor
     * 
     * does not extend constructor for checkers_board in any way
     * 
     * anchor: optional anchor point
     */
    constructor ( anchor = undefined )
    {
        /* call base constructor */
        super ( anchor );
    }



    /* DETERMINE IF A PLAYER HAS WON */



    /* get_win_status
     *
     * returns true if white has won, false if black has won, or undefined if not a win state
     */
    get_win_status ()
    {
        if ( 
            this.pieces_in_play [ checkers_board.piece_id.white_single ] + this.pieces_in_play [ checkers_board.piece_id.white_double ] != 0 && 
            this.pieces_in_play [ checkers_board.piece_id.black_single ] + this.pieces_in_play [ checkers_board.piece_id.black_double ] == 0 
        ) return true; else
        if ( 
            this.pieces_in_play [ checkers_board.piece_id.white_single ] + this.pieces_in_play [ checkers_board.piece_id.white_double ] == 0 && 
            this.pieces_in_play [ checkers_board.piece_id.black_single ] + this.pieces_in_play [ checkers_board.piece_id.black_double ] != 0 
        ) return false; else return undefined;
    }



    /* ACTION CREATION, APPLICATION AND DETERMINATION */



    /* apply/unapply_action
     *
     * apply/unapply an action
     * 
     * action: the action to apply (can be capture or non-capture)
     * record_change: whether to set the values in this.board_change to truth (defaults to true)
     */
    apply_action ( action, record_change = true )
    {
        /* modify start and end pieces */
        this.board_layout [ action.start_pos ] = checkers_board.piece_id.empty_cell;
        this.board_layout [ action.end_pos ] = action.end_piece;

        /* modify the pieces in play */
        --this.pieces_in_play [ action.start_piece ];
        ++this.pieces_in_play [ action.end_piece ];

        /* record change */
        if ( record_change )
        {
            this.board_change [ action.start_pos ] = true;
            this.board_change [ action.end_pos ] = true;
        }

        /* make extra change if is a capture move */
        if ( action.capture_piece != checkers_board.piece_id.empty_cell )
        {
            /* modify the board */
            this.board_layout [ action.capture_pos ] = checkers_board.piece_id.empty_cell;

            /* record change if required */
            if ( record_change ) this.board_change [ action.capture_pos ] = true;
            
            /* modify pieces in play */
            --this.pieces_in_play [ action.capture_piece ];
        }
    }
    unapply_action ( action, record_change = true )
    {
        /* modify start and end pieces */
        this.board_layout [ action.start_pos ] = action.start_piece;
        this.board_layout [ action.end_pos ] = checkers_board.piece_id.empty_cell;

        /* modify the pieces in play */
        ++this.pieces_in_play [ action.start_piece ];
        --this.pieces_in_play [ action.end_piece ];

        /* record change */
        if ( record_change )
        {
            this.board_change [ action.start_pos ] = true;
            this.board_change [ action.end_pos ] = true;
        }

        /* make extra change if is a capture move */
        if ( action.capture_piece != checkers_board.piece_id.empty_cell )
        {
            /* modify the board */
            this.board_layout [ action.capture_pos ] = action.capture_piece;

            /* record change if required */
            if ( record_change ) this.board_change [ action.capture_pos ] = true;
            
            /* modify pieces in play */
            ++this.pieces_in_play [ action.capture_piece ];
        }
    }

    

    /* create_non_capture_action
     *
     * create a non-capture action object:
     * 
     * { start_piece, start_pos, end_piece, end_pos, capture_piece }, where:
     * 
     *      start_piece/pos: the piece_id and position of the piece being moved
     *      end_piece/pos: the piece_id and position of the piece after it has been moved
     *      capture_piece: always equal to checkers_board.piece_id.empty_cell
     * 
     * i, j, k, l function parameters mean the same as in the action object
     */
    create_non_capture_action ( start_pos, end_pos )
    {
        /* cache start and player */
        let start_piece = this.board_layout [ start_pos ];
        let player = checkers_board.map_piece_id_to_player [ start_piece ];

        /* create action */
        let action = 
        {
            start_piece: start_piece,
            start_pos: start_pos,
            end_piece: ( player && end_pos >= 28 ) || ( !player && end_pos < 4 ) ? checkers_board.map_piece_id_to_double_piece [ start_piece ] : start_piece,
            end_pos: end_pos,
            capture_piece: checkers_board.piece_id.empty_cell,
        };

        /* return action */
        return action;
    }

    /* create_capture_action
     *
     * create a capture action object:
     * 
     * { start_piece, start_pos, end_piece, end_pos, capture_piece, capture_pos, further_actions }, where:
     * 
     *      start_piece/pos: the piece_id and position of the piece being moved
     *      end_piece/pos: the piece_id and position of the piece after it has been moved
     *      capture_piece/pos: the piece_id and position of the piece being captured
     *      further_actions: any further actions that must be completed after capture
     * 
     * i, j, k, l, m, n function parameters mean the same as in the action object
     */
    create_capture_action ( start_pos, end_pos, capture_pos )
    {
        /* cache start piece id and player */
        let start_piece = this.board_layout [ start_pos ];
        let player = checkers_board.map_piece_id_to_player [ start_piece ];

        /* create action */
        let action =
        {
            start_piece: start_piece,
            start_pos: start_pos,
            end_piece: ( player && end_pos >= 28 ) || ( !player && end_pos < 4 ) ? checkers_board.map_piece_id_to_double_piece [ start_piece ] : start_piece,
            end_pos: end_pos,
            capture_piece: this.board_layout [ capture_pos ],
            capture_pos: capture_pos,
            further_actions: [],
        };

        /* set further_actions */
        this.apply_action ( action, false );
        this.get_piece_actions ( end_pos, action.further_actions, true );
        this.unapply_action ( action, false );

        /* return action */
        return action;
    }



    /* get_piece_actions
     *
     * gets an array of legal actions for the piece
     * 
     * pos: the position of the piece to find the actions for
     * actions: an array to store actions in (which will be returned)
     * capture_only: boolean as to whether to only consider capture moves (if undefined, it will be determined by the elements in actions)
     */
    get_piece_actions ( pos, actions = [], capture_only = undefined )
    {
        /* get piece */
        let piece = this.board_layout [ pos ];

        /* if an empty cell, return */
        if ( piece == checkers_board.piece_id.empty_cell ) return;

        /* get player */
        let player = checkers_board.map_piece_id_to_player [ piece ];

        /* get whether odd row */
        let odd_row = ( Math.floor ( pos / 4.0 ) % 2 )

        /* set capture only */
        if ( capture_only == undefined ) capture_only = ( actions.length != 0 && actions [ 0 ].capture_piece != checkers_board.piece_id.empty_cell );



        /* UP */

        /* only possible if not black single piece and is not on the edge */
        if ( piece != checkers_board.piece_id.black_single && pos < 28 )
        {

            /* LEFT */

            /* check if on edge */
            if ( pos % 8 != 0 )
            {
                /* get position in the direction specified and find the cell player at the new position */
                let new_pos = pos + 3 + odd_row;
                let cell_player = checkers_board.map_piece_id_to_player [ this.board_layout [ new_pos ] ];

                /* if the cell is empty, the action is possible, otherwise if there is an enemy in the cell, try to capture it */
                if ( cell_player != undefined )
                {
                    if ( player != cell_player && new_pos < 28 && new_pos % 8 != 0 && this.board_layout [ pos + 7 ] == checkers_board.piece_id.empty_cell ) 
                    {
                        if ( !capture_only ) { capture_only = true; actions.length = 0; }
                        actions.push ( this.create_capture_action ( pos, pos + 7, new_pos ) );
                    }
                } else if ( !capture_only ) actions.push ( this.create_non_capture_action ( pos, new_pos ) );
            }

            

            /* RIGHT */

            /* check if on edge */
            if ( pos % 8 != 7 )
            {
                /* get coordinates in the direction specified and find the cell player at the new coords */
                let new_pos = pos + 4 + odd_row;
                let cell_player = checkers_board.map_piece_id_to_player [ this.board_layout [ new_pos ] ];

                /* if the cell is empty, the action is possible, otherwise if there is an enemy in the cell, try to capture it */
                if ( cell_player != undefined )
                {
                    if ( player != cell_player && new_pos < 28 && new_pos % 8 != 7 && this.board_layout [ pos + 9 ] == checkers_board.piece_id.empty_cell ) 
                    {
                        if ( !capture_only ) { capture_only = true; actions.length = 0; }
                        actions.push ( this.create_capture_action ( pos, pos + 9, new_pos ) );
                    }
                } else if ( !capture_only ) actions.push ( this.create_non_capture_action ( pos, new_pos ) );
            }
        }

        

        /* DOWN */

        /* only possible if not white single piece and is not on the edge */
        if ( piece != checkers_board.piece_id.white_single && pos >= 4 )
        {

            /* LEFT */

            /* check if on edge */
            if ( pos % 8 != 0 )
            {
                /* get coordinates in the direction specified and find the cell player at the new coords */
                let new_pos = pos - 5 + odd_row;
                let cell_player = checkers_board.map_piece_id_to_player [ this.board_layout [ new_pos ] ];

                /* if the cell is empty, the action is possible, otherwise if there is an enemy in the cell, try to capture it */
                if ( cell_player != undefined )
                {
                    if ( player != cell_player && new_pos >= 4 && new_pos % 8 != 0 && this.board_layout [ pos - 9 ] == checkers_board.piece_id.empty_cell ) 
                    {
                        if ( !capture_only ) { capture_only = true; actions.length = 0; }
                        actions.push ( this.create_capture_action ( pos, pos - 9, new_pos ) );
                    }
                } else if ( !capture_only ) actions.push ( this.create_non_capture_action ( pos, new_pos ) );
            }

            

            /* RIGHT */

            /* check if on edge */
            if ( pos % 8 != 7 )
            {
                /* get coordinates in the direction specified and find the cell player at the new coords */
                let new_pos = pos - 4 + odd_row;
                let cell_player = checkers_board.map_piece_id_to_player [ this.board_layout [ new_pos ] ];

                /* if the cell is empty, the action is possible, otherwise if there is an enemy in the cell, try to capture it */
                if ( cell_player != undefined )
                {
                    if ( player != cell_player && new_pos >= 4 && new_pos % 8 != 7 && this.board_layout [ pos - 7 ] == checkers_board.piece_id.empty_cell )
                    {
                        if ( !capture_only ) { capture_only = true; actions.length = 0; }
                        actions.push ( this.create_capture_action ( pos, pos - 7, new_pos ) );
                    }
                } else if ( !capture_only ) actions.push ( this.create_non_capture_action ( pos, new_pos ) );
            }
        }

        /* return actions */
        return actions;
    }
     


    /* get_player_actions
     *
     * returns an array of legal actions for all the pieces owned by that player
     * 
     * player: boolean for the player (white = true, black = false)
     */
    get_player_actions ( player )
    {
        /* set actions to an empty array */
        let actions = [];

        /* loop through cells of the board */
        for ( let pos = 0; pos < 32; ++pos )
        {
            /* get the piece id and cell player */
            let cell_piece = this.board_layout [ pos ];
            let cell_player = checkers_board.map_piece_id_to_player [ cell_piece ];

            /* continue if incorrect player */
            if ( player != cell_player ) continue;

            /* get actions for the piece */
            this.get_piece_actions ( pos, actions );
        }   

        /* return actions */
        return actions;
    }



    /* ESTIMATE UTILITY */



    /* estimate_utility
     *
     * gets a value for the utility of the board layout through the difference between the player utilities
     * a positive value favours white
     */
    estimate_utility ()
    {   
        /* return the difference between the individual utilities */
        return this.estimate_player_utility ( true ) - this.estimate_player_utility ( false );
    }

    /* estimate_player_utility
     *
     * estimate the utility for a player
     */
    estimate_player_utility ( player )
    {
        /* return immediately if a win state */
        let win_status = this.get_win_status ();
        if ( win_status == player  ) return Infinity;
        if ( win_status == !player ) return -Infinity;

        /* let utility start as 0 */
        let utility = 0;


        
        /* STRATEGY A: AIM FOR DOUBLE PIECES
         *
         * this strategy is used if there are some single pieces
         *
         * a single piece's value is a decelerating function of its distance from the edge:
         * 
         *      v = S + ( D - S ) * ( dist / 7.0 ) ^ 0.66
         * 
         * where S is the value of a single piece on the edge, and D is the value of a double piece the moment it is crowned
         * the use of a decelerating function will prompt further back pieces to catch up with those in front
         * 
         * a double piece is currently left at a constant value of D
         * 
         * a bonus is rewarded for a single piece being backed up by a piece behind it
         * the number of pieces backing it up defines the bonus:
         * 
         *      1: bonus of 1
         *      2: bonus of 3
         * 
         * a bonus is also given by the number of pieces in the back row, mapped by an accelerating function:
         * 
         *      v = B * ( num_pcs / 4.0 ) ^ Bp
         * 
         * where B is a constant and P is defined by
         * 
         *      Bp = ( log S/B ) / ( log 1/4 )
         * 
         * since this Bp will give S when num_pcs == 1 
         *
         * 
         * 
         * STRATEGY B: KILL OFF THE OTHER PLAYER
         * 
         * once the player has all kings, they should aim to kill the other player
         * 
         */

        /* the constants described above */
        let S = 1.0;
        let D = 6.0;
        let B = 16.0;
        let Bp = 2.0; //Math.log ( S / B ) / Math.log ( 0.25 );



        /* check that there are some non-kings left */
        if ( this.pieces_in_play [ player ? checkers_board.piece_id.white_single : checkers_board.piece_id.black_single ] != 0 )
        {


            /* number of edge pieces */
            let edge_pieces = 0;

            /* loop through board */
            for ( let pos = 0; pos < 32; ++pos ) 
            {
                /* get piece */
                let piece = this.board_layout [ pos ];

                /* continue if not the correct player */
                if ( player != checkers_board.map_piece_id_to_player [ piece ] ) continue;

                /* switch for whether a double or single piece */
                if ( piece == ( player ? checkers_board.piece_id.white_single : checkers_board.piece_id.black_single ) )
                {
                    /* get the distance from the edge */
                    let dist_from_edge = Math.floor ( pos / 4.0 );
                    if ( !player ) dist_from_edge = 7 - dist_from_edge;

                    /* if on back row, increment edge_pieces */
                    if ( dist_from_edge == 0 ) ++edge_pieces;

                    /* get whether odd row */
                    let odd_row = ( Math.floor ( pos / 4.0 ) % 2 );

                    /* get the number of backup pieces */
                    let backup = ( player ?
                        ( checkers_board.map_piece_id_to_player [ this.board_layout [ pos - 5 + odd_row ] ] == player ) + ( checkers_board.map_piece_id_to_player [ this.board_layout [ pos - 4 + odd_row ] ] == player ) :
                        ( checkers_board.map_piece_id_to_player [ this.board_layout [ pos + 3 + odd_row ] ] == player ) + ( checkers_board.map_piece_id_to_player [ this.board_layout [ pos + 4 + odd_row ] ] == player ) );

                    /* add value to utility from piece position */
                    utility += S + ( D - S ) * Math.pow ( dist_from_edge / 7.0, 0.66 );

                    /* add value to utility from backup pieces */
                    if ( backup == 1 ) utility += 1; else
                    if ( backup == 2 ) utility += 3;
                } else
                {
                    /* apply a constant utility bonus */
                    utility += D;
                }
            }

            /* apply edge piece bonus */
            utility += B * Math.pow ( edge_pieces / 4.0, Bp );


        } else

        

        {


            
            utility += this.pieces_in_play [ player ? checkers_board.piece_id.white_double : checkers_board.piece_id.black_double ] * 6;


        }


        /* return utility */
        return utility;
    }



    /* MINIMAX WITH ALPHA-BETA PRUNING SEARCH */



    /* minimax_max_utility
     * minimax_min_utility
     * 
     * using minimax with alpha-beta pruning, find the action a player should perform
     *
     * player: boolean for the player being considered
     * actions: legal actions that player can take
     * depth: the number of turns to consider the actions for
     * alpha/beta: alpha and beta values for alpha-beta pruning (defaults to +-Infinity)
     * return_action: whether an optimal action or utility value should be returned (defaults to true, is set to false by further recursive calls)
     */
    minimax_search ( player, actions, depth, alpha = -Infinity, beta = Infinity, return_action = true )
    {
        /* if depth == 0 or at a terminal state, return the utility of the state */
        if ( depth == 0 || actions.length == 0 || this.get_win_status () != undefined ) return ( return_action ? undefined : this.estimate_utility ( player ) );

        /* if should return action and there is only one possible action, return it */
        if ( return_action && actions.length == 1 ) return actions [ 0 ];

        /* set the utility to +- infinity depending on what is the worst possible */
        let utility = ( player ? -Infinity : Infinity )

        /* the index of the action to return */
        let utility_indices = [ 0 ];

        /* loop through the actions */
        for ( let i = 0; i < actions.length; ++i )
        {
            /* get the action */
            let action = actions [ i ];

            /* apply the action */
            this.apply_action ( action, false );

            /* the utility of the action */
            let action_utility;

            /* if the action was a capture and further captures are availible, recall as the same player */
            if ( action.capture_piece != checkers_board.piece_id.empty_cell && action.further_actions.length != 0 )
                action_utility = this.minimax_search ( player, action.further_actions, depth, alpha, beta, false );
            
            /* else call as the other player */
            else action_utility = this.minimax_search ( !player, this.get_player_actions ( !player ), depth - 1, alpha, beta, false );

            /* if the action utility is better than the current utility, reset the utility */
            if ( return_action )
            {
                if ( ( player && action_utility == utility ) || ( !player && action_utility == utility ) ) utility_indices.push ( i ); else
                if ( ( player && action_utility >  utility ) || ( !player && action_utility <  utility ) ) { utility = action_utility; utility_indices = [ i ]; }
            } else if ( ( player && action_utility >  utility ) || ( !player && action_utility <  utility ) ) utility = action_utility;

            /* unapply the action */
            this.unapply_action ( action, false );

            /* using alpha or beta, return if the utility means the other player will never choose this route */
            if ( ( player && utility >= beta ) || ( !player && utility <= alpha ) ) return ( return_action ? actions [ utility_indices [ Math.floor ( Math.random () * utility_indices.length ) ] ] : utility );

            /* set set alpha or beta */
            if ( player ) alpha = Math.max ( alpha, utility );
            else beta = Math.min ( beta, utility );
        }

        /* return the utility/index */
        return ( return_action ? actions [ utility_indices [ Math.floor ( Math.random () * utility_indices.length ) ] ] : utility );
    }



    /* EVENT HANDLERS FOR DRAGGING AND DROPPING */



    /* dragstart callback for piece */
    checkers_piece_dragstart_handler ( ev )
    {
        /* set data to be actions */
        ev.dataTransfer.setData ( "text/plain",  JSON.stringify ( { player: ev.target.checkers_player,  actions: ev.target.checkers_actions, is_promise: ev.target.checkers_is_promise } ) );
    }



    /* checkers board cell dragover handler */
    checkers_board_cell_dragover_handler ( ev )
    {
        /* prevent default and set drop effect to move */
        ev.preventDefault ();

        /* set drop effect to move */
        ev.dataTransfer.dropEffect = "move";
    }



    /* checkers board cell drop handler */
    checkers_board_cell_drop_handler ( ev )
    {
        /* prevent default */
        ev.preventDefault ();

        /* get the cell's position */
        let pos = ev.target.checkers_pos;

        /* get data from piece */
        let piece_data = JSON.parse ( ev.dataTransfer.getData ( "text/plain" ) );

        /* search to see if the action was possible */
        let action = piece_data.actions.find ( action => ( pos == action.end_pos ) );

        /* if action was found... */
        if ( action != undefined ) 
        {
            /* apply action */
            this.apply_action ( action );

            /* render */
            this.render ();

            /* if further actions are availible, cause them to occur */
            if ( action.capture_piece != checkers_board.piece_id.empty_cell && action.further_actions.length != 0 ) this.user_move ( piece_data.player, action.further_actions, piece_data.is_promise ); else
            
            /* else if a promise should be being resolved, resolve it */
            if ( piece_data.is_promise )
            {
                /* if promise functions not defined, throw */
                if ( this.user_move_resolve == undefined || this.user_move_reject == undefined ) throw "cannot fulfil promise without defined resolve and reject functions";

                /* get win status */
                let win_status = this.get_win_status ();

                /* if undefined, resolve the promise, else reject it */
                if ( win_status == undefined ) this.user_move_resolve ( !piece_data.player );
                else this.user_move_reject ( win_status );
            }
        }
    }
    


    /* SET UP PIECES TO BE DRAGGED TO ALLOW USER INPUT */



    /* user_move
     *
     * sets a player's pieces to be draggable to a new position to cause pieces to be moveable
     * re-rendering will cause the pieces to become un-draggable again
     * 
     * will throw if somebody has already won
     * will immediately return !player if there is no availible move, otherwise will return undefined
     * 
     * player: boolean for the player the user should control
     * actions: the actions the player should be able to perform (defaults to undefined which means the actions will be found from this.get_player_actions ( player ))
     * is_promise: whether at the end of the turn a promise should be resolved
     */
    user_move ( player, actions = undefined, is_promise = false )
    {
        /* render to ensure the board is up to date */
        this.render ();

        /* throw if a win has already occured */
        if ( this.get_win_status () != undefined ) throw "invalid call to user_move on already terminated game";

        /* let be the player' s possible actions */
        if ( actions == undefined ) actions = this.get_player_actions ( player );

        /* if there are no actions, the other player has won */
        if ( actions.length == 0 ) return !player;

        /* loop through the pieces */
        for ( let pos = 0; pos < 32; ++pos )
        {
            /* continue if not the player required */
            if ( player != checkers_board.map_piece_id_to_player [ this.board_layout [ pos ] ] ) continue;

            /* loop through actions and if an action matched the piece */
            for ( let action of actions ) if ( pos == action.start_pos )
            {
                /* if is not draggable (i.e. this is the first action associated with the piece ) */
                if ( !this.board_piece_elements [ pos ].draggable )
                {
                    /* set to draggable and add actions attribute */
                    this.board_piece_elements [ pos ].draggable = true;
                    this.board_piece_elements [ pos ].checkers_player = player;
                    this.board_piece_elements [ pos ].checkers_actions = [ action ];
                    this.board_piece_elements [ pos ].checkers_is_promise = is_promise;

                    /* dragstart */
                    this.board_piece_elements [ pos ].ondragstart = this.checkers_piece_dragstart_handler.bind ( this );
                }

                /* else add action */
                else this.board_piece_elements [ pos ].checkers_actions.push ( action );
            }
        }
    }



    /* MAKE THE BEST MOVE(S) USING MINIMAX */



    /* computer_move
     *
     * use minimax to choose and perform a move or moves
     * 
     * will throw if a player has already won
     * will return true/false if white/black has newly won because of this move
     * 
     * player: boolean for the player to move
     * depth: the depth to apply to minimax
     * actions: the actions the player can perform (or undefined which will calculate them automatically)
     */
    computer_move ( player, depth, actions = undefined )
    {
        /* render to ensure the board is up to date */
        this.render ();

        /* throw if a win has already occured */
        if ( this.get_win_status () != undefined ) throw "invalid call to computer_move on already terminated game";

        /* let actions originally be the player's possible actions */
        if ( actions == undefined ) actions = this.get_player_actions ( player );

        /* if no actions are availible, return !player */
        if ( actions.length == 0 ) return !player;

        /* loop until break */
        while ( true )
        {
            /* find the best move */
            let action = this.minimax_search ( player, actions, depth );

            /* make the move */
            this.apply_action ( action );

            /* if the action was a capture and further moves are possible, loop over, else break */
            if ( action.capture_piece != checkers_board.piece_id.empty_cell && action.further_actions.length != 0 ) actions = action.further_actions;
            else break; 
        }

        /* render */
        this.render ();

        /* if a player has now won, return which one has */
        return this.get_win_status ();
    }



    /* RETURN PROMISES FOR EASIER CONTROL */



    /* promise_user_move
     *
     * call user_move but as a promise
     * when the user has finished their move one of the resolve or reject will be called
     * resolve is called if it is not a win state, and the resolve value is a boolean for the next player
     * reject is called if a player has won, and the value is yet again a boolean for which player has won
     * 
     * player: the player the user should control
     * actions: optionally the actions the user can perform
     */
    promise_user_move ( player, actions = undefined )
    {
        /* return new promise */
        return new Promise ( ( resolve, reject ) =>
        {
            /* call user_move */
            let win_status = this.user_move ( player, actions, true );

            /* if win_status is undefined, copy resolve and reject functions into object, else immediately reject */
            if ( win_status == undefined )
            {
                this.user_move_resolve = resolve;
                this.user_move_reject = reject;
            } else reject ( win_status );            
        } );
    }

    /* promise_computer_move
     *
     * call computer_move but as a promise
     * see promise_user_move for how resolve and reject are called
     * 
     * player: boolean for the player to move
     * depth: the depth to apply to minimax
     * actions: the actions the player can perform (or undefined which will calculate them automatically)
     */
    promise_computer_move ( player, depth, actions = undefined )
    {
        /* return new promise */
        return new Promise ( ( resolve, reject ) =>
        {
            /* call computer_move */
            let win_status = this.computer_move ( player, depth, actions );

            /* if win_status is undefined, resolve as the other player, else immediately reject */
            if ( win_status == undefined ) resolve ( !player ); else reject ( win_status );            
        } );
    }
}