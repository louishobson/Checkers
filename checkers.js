/*
 * Copyright (C) 2020 Louis Hobson <louis-hobson@hotmail.co.uk>. All Rights Reserved.
 * 
 * Distributed under MIT licence as a part of experiments into game-playing AI
 * For details, see: https://github.com/louishobson/BoardGames/blob/master/LICENSE
 *
 * checkers.js
 *
 * javascript for playing checkers
 *
 */



/* checkers board class
 *
 * manages the checkers board 
 */
class checkers_board
{

    /* id for what type of piece is present on a cell */
    static #piece_id = 
    {
        empty_cell: 0,
        white_single: 1,
        black_single: 2,
        white_double: 3,
        black_double: 4
    }

    /* id for types of movement */
    static #movement_id = 
    {
        up_left: 0,
        up_right: 1,
        down_left: 2,
        down_right: 3
    }

    /* map of piece ids to players */
    static #map_piece_id_to_player =
    [
        undefined,
        true, 
        false,
        true,
        false
    ]

    /* map of piece ids to their double counterparts */
    static #map_piece_id_to_double_piece =
    [
        undefined,
        3,
        4,
        3,
        4
    ]



    /* 4x8 2d array of numbers for storing the pieces in each cell
     * array is column major
     */
    #board;
    


    /* constructor
     * 
     * sets up the default board
     */
    constructor ()
    {
        /* set the arrays to 1d */
        this.#board = new Array ( 4 );

        /* loop over 1d to set to 2d */
        for ( let i = 0; i < 4; ++i ) 
        {
            /* set to 2d */
            this.#board [ i ] = new Array ( 8 );

            /* set the values of each array */
            for ( let j = 0; j < 8; ++j )
            {
                /* else if j < 3, set the piece to be white */
                if ( j < 3 ) this.#board [ i ] [ j ] = checkers_board.#piece_id.white_single; else

                /* else if j > 4, set the piece to be black */
                if ( j > 4 ) this.#board [ i ] [ j ] = checkers_board.#piece_id.black_single; else

                /* else set to empty */
                this.#board [ i ] [ j ] = checkers_board.#piece_id.empty_cell;
            }
        }
    }



    /* render
     *
     * method to render the board to a board
     */
    render ()
    {
        /* loop through the board element to find each cell */
        for ( let i = 0; i < 4; ++i ) for ( let j = 0; j < 8; ++j )
        {
            /* get the cell element */
            let cell_element = document.getElementById ( "c-" + i + j );

            /* empty the cell */
            cell_element.innerHTML = "";

            /* if no piece should be in the cell, continue */
            if ( this.#board [ i ] [ j ] == checkers_board.#piece_id.empty_cell ) continue;

            /* otherwise create a piece */
            let piece_element = document.createElement ( "img" );
            
            /* set id */
            piece_element.id = "p-" + i + j;
            
            /* set classes */
            piece_element.classList.add ( "checkers-piece" );

            /* set image src */
            piece_element.src = "checkers_piece_" + this.#board [ i ] [ j ] + ".png";

            /* append to cell */
            cell_element.appendChild ( piece_element );
        }
    }



    /* apply/unapply_action
     *
     * apply/unapply an action
     */
    apply_action ( action )
    {
        /* switch for if is a capture action */
        if ( action.capture == checkers_board.#piece_id.empty_cell )
        {
            this.#board [ action.i ] [ action.j ] = checkers_board.#piece_id.empty_cell;
            this.#board [ action.k ] [ action.l ] = action.end;
        } else
        {
            this.#board [ action.i ] [ action.j ] = checkers_board.#piece_id.empty_cell;
            this.#board [ action.k ] [ action.l ] = action.end;
            this.#board [ action.m ] [ action.n ] = checkers_board.#piece_id.empty_cell;
        }
    }
    unapply_action ( action )
    {
        /* switch for if is a capture action */
        if ( action.capture == checkers_board.#piece_id.empty_cell )
        {
            this.#board [ action.i ] [ action.j ] = action.start;
            this.#board [ action.k ] [ action.l ] = checkers_board.#piece_id.empty_cell;
        } else
        {
            this.#board [ action.i ] [ action.j ] = action.start;
            this.#board [ action.k ] [ action.l ] = checkers_board.#piece_id.empty_cell;
            this.#board [ action.m ] [ action.n ] = action.capture;
        }
    }

    

    /* create_non_capture_action
     *
     * create a non-capture action object
     */
    create_non_capture_action ( i, j, k, l )
    {
        /* cache start and player */
        let start = this.#board [ i ] [ j ];
        let player = checkers_board.#map_piece_id_to_player [ start ];

        /* create action */
        let action = 
        {
            start: start,
            capture: checkers_board.#piece_id.empty_cell,
            end: ( player && l == 7 ) || ( !player && l == 0 ) ? checkers_board.#map_piece_id_to_double_piece [ start ] : start,
            i: i, j: j, k: k, l: l
        };

        /* return action */
        return action;
    }

    /* create_capture_action
     *
     * create a capture action object
     */
    create_capture_action ( i, j, k, l, m, n )
    {
        /* cache start piece id and player */
        let start = this.#board [ i ] [ j ];
        let player = checkers_board.#map_piece_id_to_player [ start ];

        /* create action */
        let action =
        {
            start: start,
            capture: this.#board [ m ] [ n ],
            end: ( player && l == 7 ) || ( !player && l == 0 ) ? checkers_board.#map_piece_id_to_double_piece [ start ] : start,
            further_actions: [],
            i: i, j: j, k: k, l: l, m: m, n: n
        };

        /* set further_actions */
        this.apply_action ( action );
        this.get_piece_actions ( k, l, action.further_actions, true );
        this.unapply_action ( action );

        /* return action */
        return action;
    }




    /* get_piece_actions
     *
     * gets the actions for a piece
     * 
     * i, j: the coordinates of the piece to find the actions for
     * actions: an array to store actions in (which will be returned)
     */
    get_piece_actions ( i, j, actions = [], capture_only = undefined )
    {
        /* get piece */
        let piece = this.#board [ i ] [ j ];

        /* if an empty cell, return */
        if ( piece == checkers_board.#piece_id.empty_cell ) return;

        /* get player */
        let player = checkers_board.#map_piece_id_to_player [ piece ];

        /* set capture only */
        if ( capture_only == undefined ) capture_only = ( actions.length != 0 && actions [ 0 ].capture != checkers_board.#piece_id.empty_cell );



        /* UP */

        /* only possible if not black single piece and is not on the edge */
        if ( piece != checkers_board.#piece_id.black_single && j != 7 )
        {

            /* LEFT */

            /* check if on edge */
            if ( i != 0 || ( j & 1 ) == 1 )
            {
                /* get coordinates in the direction specified and find the cell player at the new coords */
                let k = i - 1 + ( j & 1 ), l = j + 1;
                let cell_player = checkers_board.#map_piece_id_to_player [ this.#board [ k ] [ l ] ];

                /* if the cell is empty, the action is possible, otherwise if there is an enemy in the cell, try to capture it */
                if ( cell_player != undefined )
                {
                    if ( player != cell_player && i != 0 && j != 6 && this.#board [ i - 1 ] [ j + 2 ] == checkers_board.#piece_id.empty_cell ) 
                    {
                        if ( !capture_only ) { capture_only = true; actions.length = 0; }
                        actions.push ( this.create_capture_action ( i, j, i - 1, j + 2, k, l ) );
                    }
                } else if ( !capture_only ) actions.push ( this.create_non_capture_action ( i, j, k, l ) );
            }

            

            /* RIGHT */

            /* check if on edge */
            if ( i != 3 || ( j & 1 ) == 0 )
            {
                /* get coordinates in the direction specified and find the cell player at the new coords */
                let k = i + ( j & 1 ), l = j + 1;
                let cell_player = checkers_board.#map_piece_id_to_player [ this.#board [ k ] [ l ] ];

                /* if the cell is empty, the action is possible, otherwise if there is an enemy in the cell, try to capture it */
                if ( cell_player != undefined )
                {
                    if ( player != cell_player && i != 3 && j != 6 && this.#board [ i + 1 ] [ j + 2 ] == checkers_board.#piece_id.empty_cell ) 
                    {
                        if ( !capture_only ) { capture_only = true; actions.length = 0; }
                        actions.push ( this.create_capture_action ( i, j, i + 1, j + 2, k, l ) );
                    }
                } else if ( !capture_only ) actions.push ( this.create_non_capture_action ( i, j, k, l ) );
            }
        }

        

        /* DOWN */

        /* only possible if not white single piece and is not on the edge */
        if ( piece != checkers_board.#piece_id.white_single && j != 0 )
        {

            /* LEFT */

            /* check if on edge */
            if ( i != 0 || ( j & 1 ) == 1 )
            {
                /* get coordinates in the direction specified and find the cell player at the new coords */
                let k = i - 1 + ( j & 1 ), l = j - 1;
                let cell_player = checkers_board.#map_piece_id_to_player [ this.#board [ k ] [ l ] ];

                /* if the cell is empty, the action is possible, otherwise if there is an enemy in the cell, try to capture it */
                if ( cell_player != undefined )
                {
                    if ( player != cell_player && i != 0 && j != 1 && this.#board [ i - 1 ] [ j - 2 ] == checkers_board.#piece_id.empty_cell ) 
                    {
                        if ( !capture_only ) { capture_only = true; actions.length = 0; }
                        actions.push ( this.create_capture_action ( i, j, i - 1, j - 2, k, l ) );
                    }
                } else if ( !capture_only ) actions.push ( this.create_non_capture_action ( i, j, k, l ) );
            }

            

            /* RIGHT */

            /* check if on edge */
            if ( i != 3 || ( j & 1 ) == 0 )
            {
                /* get coordinates in the direction specified and find the cell player at the new coords */
                let k = i + ( j & 1 ), l = j - 1;
                let cell_player = checkers_board.#map_piece_id_to_player [ this.#board [ k ] [ l ] ];

                /* if the cell is empty, the action is possible, otherwise if there is an enemy in the cell, try to capture it */
                if ( cell_player != undefined )
                {
                    if ( player != cell_player && i != 3 && j != 1 && this.#board [ i + 1 ] [ j - 2 ] == checkers_board.#piece_id.empty_cell )
                    {
                        if ( !capture_only ) { capture_only = true; actions.lenth = 0; }
                        actions.push ( this.create_capture_action ( i, j, i + 1, j - 2, k, l ) );
                    }
                } else if ( !capture_only ) actions.push ( this.create_non_capture_action ( i, j, k, l ) );
            }
        }

        /* return actions */
        return actions;
    }
     



    /* get_player_actions
     *
     * returns the following array of objects:
     * 
     * [ { start, capture, end, *further_actions, i, j, k, l, *m, *n }... ], where:
     * 
     *      start: the piece id of the piece who's action this refers to
     *      capture:  the piece id of the piece being captured (or an empty cell for no capture)
     *      end: the piece id of the new piece after movement
     *      further_actions: further captures that must be made by that piece
     *      i, j: the coordinates of the original piece
     *      k, l: the new coordinates of the piece after moving
     *      m, n: if capture is not an empty_cell, these will be the coordinates of the captured piece
     * 
     * all attributes with a '*' are only present if capture is not an empty cell
     * 
     * player: boolean for the player (white = true, black = false)
     */
    get_player_actions ( player )
    {
        /* set actions to an empty array */
        let actions = [];

        /* loop through cells of the board */
        for ( let i = 0; i < 4; ++i ) for ( let j = 0; j < 8; ++j )
        {
            /* get the piece id and cell player */
            let cell_piece = this.#board [ i ] [ j ];
            let cell_player = checkers_board.#map_piece_id_to_player [ cell_piece ];

            /* continue if incorrect player */
            if ( player != cell_player ) continue;

            /* get actions for the piece */
            this.get_piece_actions ( i, j, actions );
        }   

        /* return actions */
        return actions;
    }



    /* has_player_won
     *
     * returns a boolean for if a player has won (returns true for a draw state)
     */
    has_player_won ( player )
    {
        /* loop through the board */
        for ( let i = 0; i < 4; ++i ) for ( let j = 0; j < 8; ++j )
        {
            /* return false if an opposing piece is present */
            if ( checkers_board.#map_piece_id_to_player [ this.#board [ i ] [ j ] ] == !player ) return false;
        }

        /* else return true */
        return true;
    }



    /* estimate_utility
     *
     * gets a value for the utility of the board layout
     * a positive value favours white
     */
    estimate_utility ()
    {   
        /* let utility start as 0 */
        let utility = 0;

        /* let the number of white and black pieces both be 0 */
        let white_pieces = 0, black_pieces = 0;

        /* white and black edge pieces */
        let white_edge_pieces = 0, black_edge_pieces = 0;

        /* loop through board */
        for ( let i = 0; i < 4; ++i ) for ( let j = 0; j < 8; ++j )
        {
            /* get the player of the piece */
            let player = checkers_board.#map_piece_id_to_player [ this.#board [ i ] [ j ] ];

            /* continue if the cell is empty */
            if ( player == undefined ) continue;

            /* get the piece id */
            let piece = this.#board [ i ] [ j ];

            /* add to white/black_pieces */
            if ( player ) ++white_pieces; else ++black_pieces;

            /* get the sign of the piece */
            let sign = ( player ? +1 : -1 );

            /* get the distance from the edge and the centre */
            let dist_from_edge = ( player ? j : 7 - j );
            let dist_from_centre = ( j < 4 ? 3 - j : j - 4 );

            /* switch through particular pieces
             *
             * the value of any single piece is a function of its distance the back row:
             * 
             *     value = 1 + 3( distance / 6 ) ^ 0.66
             * 
             * this puts weight on pushing up pieces behind those that leave first, since the less value moving forward is the further away a unit gets
             * the utility is increased by one for each piece directly behind a single piece
             * 
             * the value of a double piece is given by its distance from the centre (where the centre rows are 0):
             * 
             *     value = 5 - ( distance / 3 ) ^ 1.5
             * 
             * this pushes double pieces back to the centre in the same way that single pieces are pushed forwards
             * 
             */
            /* if single piece */
            if ( piece <= checkers_board.#piece_id.black_single )
            {
                /* +- to utility using function of value */
                utility += sign * ( 1 + 3 * Math.pow ( dist_from_edge / 7.0, 0.66 ) );

                /* if on back row, ++ the number of edge pieces */
                if ( dist_from_edge == 0 ) { if ( player ) ++white_edge_pieces; else ++black_edge_pieces; } else
                {               
                    /* else add to utility if a piece is directly behind this piece */
                    let backed_up = 
                        ( player == checkers_board.#map_piece_id_to_player [ this.#board [ i ] [ j - 1 * sign ] ] ) +
                        ( ( j & 1 ) == 1 && i != 3 && player == checkers_board.#map_piece_id_to_player [ this.#board [ i + 1 ] [ j - 1 * sign ] ] ) ||
                        ( ( j & 1 ) == 0 && i != 0 && player == checkers_board.#map_piece_id_to_player [ this.#board [ i - 1 ] [ j - 1 * sign ] ] );
                    if ( backed_up == 1 ) utility += sign * 1; else
                    if ( backed_up == 2 ) utility += sign * 3;   
                }
            } else

            /* else if doule piece */
            if ( piece >= checkers_board.#piece_id.white_double )
            {
                /* +- to utility using function of value */
                utility += sign * ( 6 - 1.0 * Math.pow ( dist_from_centre / 3.0, 1.5 ) );
                //utility = sign * 4;
            }            
        }

        /* add edge piece bonus */
        utility += 16 * ( Math.pow ( white_edge_pieces / 4.0, 2.5 ) - Math.pow ( black_edge_pieces / 4.0, 2.5 ) );

        /* return infinity if one of the players has won */
        if ( black_pieces == 0 && white_pieces != 0 ) return Infinity; else
        if ( white_pieces == 0 && black_pieces != 0 ) return -Infinity;

        /* else return utility */
        return utility;
    }



    /* minimax_search
     * minimax_max_utility
     * minimax_min_utility
     * 
     * using minimax with alpha-beta pruning, find the action a player should perform
     *
     * player: boolean for the player to start with
     */
    minimax_search ( player, actions, depth )
    {
        /* if only one action, return it */
        if ( actions.length == 1 ) return actions [ 0 ];

        /* else return the best action */
        return ( player ? this.minimax_max_utility ( actions, depth ) : this.minimax_min_utility ( actions, depth ) );      
    }
    minimax_max_utility ( actions, depth, alpha = -Infinity, beta = Infinity, return_action = true )
    {
        /* if depth == 0 or at a terminal state, return the utility of the state */
        if ( depth == 0 || this.has_player_won ( true ) ) return this.estimate_utility ( true );

        /* let the utility of the state be negative infinity (the worst possible) */
        let utility = -Infinity;

        /* the index of the action to return */
        let utility_index = 0;

        /* loop through the actions */
        for ( let i = 0; i < actions.length; ++i )
        {
            /* get the action */
            let action = actions [ i ];

            /* apply the action */
            this.apply_action ( action );

            /* the utility of the action */
            let action_utility;

            /* if the action was a capture and further captures are availible, choose the maximum of the result of those */
            if ( action.capture != checkers_board.#piece_id.empty_cell && action.further_actions.length != 0 )
                action_utility = this.minimax_max_utility ( action.further_actions, depth, alpha, beta, false );
            
                /* else choose the minimum of the next player's turn */
            else action_utility = this.minimax_min_utility ( this.get_player_actions ( false ), depth - 1, alpha, beta, false );

            /* if the action utility is greater than the current utility, reset the utility */
            if ( action_utility > utility ) { utility = action_utility; utility_index = i; }

            /* unapply the action */
            this.unapply_action ( action );

            /* if utility is greater than or eq to beta, then the other player will never choose this path, so return utility/index */
            if ( utility >= beta ) return ( return_action ? actions [ utility_index ] : utility );

            /* set alpha to the max of alpha and utility */
            alpha = Math.max ( alpha, utility );
        }

        /* return the utility/index */
        return ( return_action ? actions [ utility_index ] : utility );
    }
    minimax_min_utility ( actions, depth, alpha = -Infinity, beta = Infinity, return_action = true )
    {
        /* if depth == 0 or at a terminal state, return the utility of the state */
        if ( depth == 0 || this.has_player_won ( false ) ) return this.estimate_utility ( false );

        /* let the utility of the state be negative infinity (the worst possible) */
        let utility = Infinity;

        /* the index of the action to return */
        let utility_index = 0;

        /* loop through the actions */
        for ( let i = 0; i < actions.length; ++i )
        {
            /* get the action */
            let action = actions [ i ];

            /* apply the action */
            this.apply_action ( action );

            /* the utility of the action */
            let action_utility;

            /* if the action was a capture and further captures are availible, choose the minimum of the result of those */
            if ( action.capture != checkers_board.#piece_id.empty_cell && action.further_actions.length != 0 )
                action_utility = this.minimax_min_utility ( action.further_actions, depth, alpha, beta, false );
            
                /* else choose the maximum of the next player's turn */
            else action_utility = this.minimax_max_utility ( this.get_player_actions ( true ), depth - 1, alpha, beta, false );

            /* if the action utility is less than the current utility, reset the utility */
            if ( action_utility < utility ) { utility = action_utility; utility_index = i; }

            /* unapply the action */
            this.unapply_action ( action );

            /* if utility is less than or eq to than alpha, then the other player will never choose this path, so return utility/index */
            if ( utility <= alpha ) return ( return_action ? actions [ utility_index ] : utility );

            /* set beta to the minimum of beta and utility */
            beta = Math.min ( beta, utility );
        }

        /* return the utility/index */
        return ( return_action ? actions [ utility_index ] : utility );
    }



    async self_play ()
    {
        let player = true;

        let actions = this.get_player_actions ( player );

        while ( !this.has_player_won ( true ) && !this.has_player_won ( false ) )
        {
            let action = this.minimax_search ( player, actions, 9 );
            await new Promise ( r => { setTimeout ( r, 100 ); } ); 
            this.render ();
            this.apply_action ( action );
            if ( action.capture != checkers_board.#piece_id.empty_cell && action.further_actions.length != 0 ) actions = action.further_actions;
            else { player = !player; actions = this.get_player_actions ( player ); }
        }
    }



}