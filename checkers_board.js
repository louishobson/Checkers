/*
 * Copyright (C) 2020 Louis Hobson <louis-hobson@hotmail.co.uk>. All Rights Reserved.
 * 
 * Distributed under MIT licence as a part of experiments into game-playing AI
 * For details, see: https://github.com/louishobson/BoardGames/blob/master/LICENSE
 *
 * checkers_board.js
 *
 * class for checkers board
 *
 */



/* checkers board class
 *
 * manages the tracking of pieces on and the rendering of a checkers board
 */
export class checkers_board
{

    /* STATIC MEMBERS */



    /* id for what type of piece is present on a cell */
    static piece_id = 
    {
        empty_cell: 0,
        white_single: 1,
        black_single: 2,
        white_double: 3,
        black_double: 4
    }

    /* map of piece ids to players */
    static map_piece_id_to_player =
    [
        undefined,
        true, 
        false,
        true,
        false
    ]

    /* map of piece ids to their double counterparts */
    static map_piece_id_to_double_piece =
    [
        undefined,
        3,
        4,
        3,
        4
    ]

    /* map of piece ids to booleans as to whether they are double pieces */
    static map_piece_id_to_is_double = 
    [
        undefined,
        false,
        false,
        true,
        true
    ];



    /* MEMBERS */



    /* DOM element for the table */
    board_element;

    /* DOM elements for the rows of the table (array of 9) */
    board_row_elements;

    /* DOM elements for the collumns (cells) of the table (2d array of 9x9) */
    board_cell_elements;

    /* DOM elements for the pieces in the cells (1d array of 32) */
    board_piece_elements;



    /* 1d array of 32 numbers for storing the pieces in each cell
     * numbering starts at 0 in the bottom left corner and increases along the row then up to the next
     */
    board_layout;

    /* 1d array of booleans for changes to the board same as in board_layout */
    board_change;

    /* the number of each type of piece on the board (an array of 5 for each piece id) */
    pieces_in_play;

    

    /* CONSTRUCTOR */



    /* constructor
     * 
     * sets up the default board
     * 
     * anchor: optional anchor point
     */
    constructor ( anchor = undefined )
    {
        /* create the board */
        this.create_board ();

        /* anchor the board */
        if ( anchor != undefined ) this.anchor_board ( anchor );

        /* reset the board */
        this.reset_board ();

        /* render the board */
        this.render ();
    }



    /* CREATING AND ANCHORING THE BOARD */



    /* create_board
     *
     * creates the DOM element for the table 
     */
    create_board ()
    {
        /* create the main table and set up its classes */
        this.board_element = document.createElement ( "table" );
        this.board_element.classList.add ( "checkers-board" );

        /* set row, cell and piece elements to be arrays */
        this.board_row_elements = new Array ( 9 );
        this.board_cell_elements = new Array ( 9 );
        this.board_piece_elements = new Array ( 32 );

        /* loop through 9 rows */
        for ( let i = 0; i < 9; ++i )
        {
            /* create the second layer of the board_cell_elements 2d array */
            this.board_cell_elements [ i ] = new Array ( 9 );

            /* create the row */
            this.board_row_elements [ i ] = document.createElement ( "tr" );

            /* append the row to the table */
            this.board_element.appendChild ( this.board_row_elements [ i ] );

            /* loop through collumns */
            for ( let j = 0; j < 9; ++j )
            {
                /* if j or i is zero, the cell is a header */
                if ( i == 0 || j == 0 )
                {
                    /* create the cell as a header */
                    this.board_cell_elements [ i ] [ j ] = document.createElement ( "th" );

                    /* if i == 0 and j != 0 add letters to header */
                    if ( i == 0 && j != 0 ) this.board_cell_elements [ i ] [ j ].innerHTML = ( "abcdefgh" ) [ j - 1 ]; else

                    /* else if i != 0 and j == 0 add letters to header */
                    if ( i != 0 && j == 0 ) this.board_cell_elements [ i ] [ j ].innerHTML = ( "12345678" ) [ i - 1 ];
                } else

                /* else the cell is normal */
                {
                    /* create the cell as data */
                    this.board_cell_elements [ i ] [ j ] = document.createElement ( "td" );

                    /* if i and j sum to an odd number, the cell is black, else it is white */
                    if ( ( i + j ) & 1 ) 
                    {
                        /* set class to black */
                        this.board_cell_elements [ i ] [ j ].classList.add ( "d" );

                        /* get the position of the cell */
                        let pos = Math.floor ( ( 8 - i ) * 4 + ( j - 1 ) / 2.0 );

                        /* copy position as attrubute into the cell of the table and set the drag callbacks */
                        this.board_cell_elements [ i ] [ j ].checkers_pos = pos;
                        this.board_cell_elements [ i ] [ j ].ondragover = this.checkers_board_cell_dragover_handler.bind ( this );
                        this.board_cell_elements [ i ] [ j ].ondrop = this.checkers_board_cell_drop_handler.bind ( this );

                        /* create an image element for the piece */
                        this.board_piece_elements [ pos ] = document.createElement ( "img" );
                        this.board_piece_elements [ pos ].classList.add ( "checkers-piece" );
                        this.board_piece_elements [ pos ].src = "checkers_piece_1.png";
                        this.board_piece_elements [ pos ].draggable = false;
                        this.board_piece_elements [ pos ].style.visibility = "hidden";

                        /* append piece element to the cell element */
                        this.board_cell_elements [ i ] [ j ].appendChild ( this.board_piece_elements [ pos ] );
                    } else 
                    {
                        /* set class to white */
                        this.board_cell_elements [ i ] [ j ].classList.add ( "l" ); 
                    }
                     
                }

                /* append the cell to the row */
                this.board_row_elements [ i ].appendChild ( this.board_cell_elements [ i ] [ j ] );
            }
        }
    }

    /* anchor_board
     *
     * appends the board to an element
     */
    anchor_board ( anchor )
    {
        /* append the main board element */
        anchor.appendChild ( this.board_element ); 
    }



    /* RESET_BOARD METHOD */



    /* reset_board
     *
     * resets the pieces on the board to their starting positions
     * the board is not re-rendered
     */
    reset_board ()
    {
        /* set the arrays */
        this.board_layout = new Array ( 32 );
        this.board_change = new Array ( 32 );

        /* loop over to set pieces */
        for ( let pos = 0; pos < 32; ++pos ) 
        {
            /* if less than 12 then set to white */
            if ( pos < 12 ) this.board_layout [ pos ] = checkers_board.piece_id.white_single; else

            /* if greater or eq to 20 then set to black */
            if ( pos >= 20 ) this.board_layout [ pos ] = checkers_board.piece_id.black_single;

            /* else set to empty */
            else this.board_layout [ pos ] = checkers_board.piece_id.empty_cell;

            /* set change to true */
            this.board_change [ pos ] = true;
        }

        /* set the number of pieces in play, where empty cells are not important and counting them will waste time */
        this.pieces_in_play = new Array ( 5 );
        this.pieces_in_play [ checkers_board.piece_id.empty_cell ] = undefined
        this.pieces_in_play [ checkers_board.piece_id.white_single ] = 12;
        this.pieces_in_play [ checkers_board.piece_id.black_single ] = 12;
        this.pieces_in_play [ checkers_board.piece_id.white_double ] = 0;
        this.pieces_in_play [ checkers_board.piece_id.black_double ] = 0;
    }



    /* RENDERING METHOD */



    /* render
     *
     * method to render the board to a board
     */
    render ()
    {
        /* loop through the board element to find each cell */
        for ( let pos = 0; pos < 32; ++pos )
        {
            /* set draggable to false */
            this.board_piece_elements [ pos ].draggable = false;

            /* continue if no change */
            if ( !this.board_change [ pos ] ) continue;

            /* else set board change to false */
            this.board_change [ pos ] = false;

            /* get the piece id */
            let piece = this.board_layout [ pos ];

            /* if no piece should be in the cell, then make the piece inside it hidden */
            if ( piece == checkers_board.piece_id.empty_cell ) 
            {
                this.board_piece_elements [ pos ].style.visibility = "hidden";
            } else

            /* else make it shown and set it to the correct piece type */
            {
                this.board_piece_elements [ pos ].src = "./checkers_piece_" + piece + ".png";
                this.board_piece_elements [ pos ].style.visibility = "visible";
            }
        }
    }

}