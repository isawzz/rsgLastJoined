import numpy as np

# --- Game State ---
# Use a NumPy array for the 3x3 board
# 0: empty, 1: Player X, 2: Player O
board = np.zeros((3, 3), dtype=int)
current_player = 1 # Start with Player X (1)
game_over = False
winner = None # 1 for Player X, 2 for Player O, 0 for Draw

# --- Game Logic Functions ---

def initialize_board():
    """Resets the game board and state."""
    global board, current_player, game_over, winner
    board = np.zeros((3, 3), dtype=int)
    current_player = 1
    game_over = False
    winner = None

def get_possible_moves(current_board):
    """Returns a list of tuples (row, col) for all empty cells."""
    moves = []
    for r in range(3):
        for c in range(3):
            if current_board[r, c] == 0:
                moves.append((int(r), int(c))) # Ensure integers for JSON
    return moves

def make_move(current_board, row, col, player):
    """
    Attempts to make a move.
    Returns True if the move was valid and made, False otherwise.
    """
    # Check if the coordinates are within bounds
    if not (0 <= row < 3 and 0 <= col < 3):
        return False
    # Check if the cell is empty
    if current_board[row, col] != 0:
        return False
    # Check if it's the correct player's turn (optional server-side check)
    # This assumes the client sends the correct player, but adding robustness is good
    # if player != current_player:
    #     return False

    current_board[row, col] = player
    return True

def check_win(current_board, player):
    """Checks if the given player has won."""
    # Check rows
    for r in range(3):
        if np.all(current_board[r, :] == player):
            return True
    # Check columns
    for c in range(3):
        if np.all(current_board[:, c] == player):
            return True
    # Check diagonals
    if np.all(np.diag(current_board) == player):
        return True
    if np.all(np.diag(np.fliplr(current_board)) == player):
            return True
    return False

def check_draw(current_board):
    """Checks if the game is a draw (board is full and no winner)."""
    return np.all(current_board != 0) and not check_win(current_board, 1) and not check_win(current_board, 2)

# Note: The game state variables (board, current_player, etc.) are defined here
# and will be imported by the Flask app.
