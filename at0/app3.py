from flask import Flask, jsonify, request
import numpy as np

# Create an instance of the Flask class
app = Flask(__name__)

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

# --- Flask Routes ---

@app.route('/')
def index():
    """
    A simple placeholder route.
    The client-side HTML/JS would typically be served separately
    or rendered dynamically here if needed.
    """
    return "Tic-Tac-Toe Server API. Interact via /game_state and /make_move."

@app.route('/game_state', methods=['GET'])
def get_game_state():
    """Returns the current game state as JSON."""
    global board, current_player, game_over, winner

    state = {
        'board': board.tolist(), # Convert NumPy array to a list for JSON
        'current_player': current_player,
        'possible_moves': get_possible_moves(board),
        'game_over': game_over,
        'winner': winner # 1 for X, 2 for O, 0 for Draw, None otherwise
    }
    return jsonify(state)

@app.route('/make_move', methods=['POST'])
def handle_move():
    """Receives a move from the client and updates the game state."""
    global board, current_player, game_over, winner

    if game_over:
        return jsonify({'error': 'Game is already over. Start a new game.'}), 400

    # Get move data from the client (expecting JSON like {'row': 0, 'col': 1})
    move_data = request.get_json()
    if not move_data or 'row' not in move_data or 'col' not in move_data:
        return jsonify({'error': 'Invalid move data. Please provide row and col.'}), 400

    row = move_data['row']
    col = move_data['col']
    player_making_move = current_player # Assume the correct player is making the move

    # Attempt to make the move
    if make_move(board, row, col, player_making_move):
        # Check for win or draw after the move
        if check_win(board, player_making_move):
            game_over = True
            winner = player_making_move
        elif check_draw(board):
            game_over = True
            winner = 0 # 0 indicates a draw
        else:
            # Switch player if the game is not over
            current_player = 3 - current_player # Switches between 1 and 2

        # Return the updated game state
        state = {
            'board': board.tolist(),
            'current_player': current_player,
            'possible_moves': get_possible_moves(board),
            'game_over': game_over,
            'winner': winner
        }
        return jsonify(state)
    else:
        # Return an error if the move was invalid
        return jsonify({'error': 'Invalid move. Cell is not empty or out of bounds.'}), 400

@app.route('/restart', methods=['POST'])
def restart_game():
    """Restarts the game."""
    initialize_board()
    state = {
        'board': board.tolist(),
        'current_player': current_player,
        'possible_moves': get_possible_moves(board),
        'game_over': game_over,
        'winner': winner
    }
    return jsonify(state)


# This block ensures the development server runs only when the script is executed directly
# It will not run when imported into another script (like passenger_wsgi.py)
if __name__ == '__main__':
    # Run the Flask development server
    # debug=True is useful for development but should be False in production
    app.run(debug=True)
