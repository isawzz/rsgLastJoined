from flask import Flask, jsonify, request
# Import game state and logic functions from the separate file
from ttt import (
    board,
    current_player,
    game_over,
    winner,
    initialize_board,
    get_possible_moves,
    make_move,
    check_win,
    check_draw
)

# Create an instance of the Flask class
app = Flask(__name__)

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
    # Access game state directly from the imported variables
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
    global current_player, game_over, winner # Need global to modify these imported variables

    if game_over:
        return jsonify({'error': 'Game is already over. Start a new game.'}), 400

    # Get move data from the client (expecting JSON like {'row': 0, 'col': 1})
    move_data = request.get_json()
    if not move_data or 'row' not in move_data or 'col' not in move_data:
        return jsonify({'error': 'Invalid move data. Please provide row and col.'}), 400

    row = move_data['row']
    col = move_data['col']
    player_making_move = current_player # Assume the correct player is making the move

    # Attempt to make the move using the imported function
    if make_move(board, row, col, player_making_move):
        # Check for win or draw after the move using imported functions
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
    # Use the imported initialize_board function
    initialize_board()
    # Access updated game state directly from the imported variables
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
