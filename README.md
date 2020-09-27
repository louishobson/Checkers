# Checkers #

Experiments into using adversarial search for playing the simple two-player game Checkers (aka English Draughts).

## How to use ##

Simply clone the master branch into a directory accessible from the web to play against the AI.

## Rules of checkers ##


* Single pieces, or men, (what you begin with) may only move diagonally forwards (white up, black down) into an empty space (so only black cells will ever be occupied).
* Pieces are moved by yourself by clicking, holding and dragging the piece into it's new position. On your turn, only pieces that can move will be able to be clicked and dragged.
* If your piece reaches the opposite side of the board, it becomes a king and can now move (and capture) in any of the four diagonal directions.
* A capture is where a piece jumps over an opposing piece diagonally adjacent to it into an empty cell.
* If a capture is possible, it must be taken. If multiple captions are possible, it is your choice which one you chose to make. This is called forced capturing. Kings are not exempt from forced capturing.
* If, once a piece has made a capture, it is then possible for it to capture again from its new position, it must capture again. This is called a multi-capture. A piece may not multi-capture after a move which resulted it in being kinged: it must wait until the next move to capture.
* A player wins if either the other player's pieces are completely irradicated, or the other player is unable to move.


## About the AI ## 

The AI is written in pure JavaScript, using the minimax search algorithm with alpha-beta pruning. For the current state, the comptuter player performs a depth-first seach on a tree of board states created from the possible actions for each player's turn. Terminal nodes are determined wither by a win state, or a depth equal to the "player difficulty". The terminal nodes are assigned a value based on generic checkers strategy, where a high value favoues white, and a low favoues black. Parent nodes are assigned the maximum value of the child nodes' values for white's turn, and the minimum for black's turn. After this search has reached back up to the root node, the computer player will choose the action which leads to the node with the best assigned value (max for white min for black). The alpha-beta part is purely an optimisation which reduces the size of the search tree by ignoring sections which will never be reached. As a heads up, there is currently no endgame database, so when there are only a few pieces left, it tends to act fairly irrationally.

