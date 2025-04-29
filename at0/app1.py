# Import the Flask class and render_template function from the flask library
from flask import Flask, render_template

# Create an instance of the Flask class
# __name__ is a special Python variable that gets the name of the current module.
# Flask uses this to know where to look for templates, static files, etc.
app = Flask(__name__)

# Define a route for the root URL ('/')
# The @app.route('/') decorator tells Flask what URL should trigger the function below
@app.route('/')
def index():
  """
  This function is called when the root URL is accessed.
  It uses render_template to serve the index.html file located in the 'templates' folder.
  """
  # Flask looks for templates inside a folder named 'templates' by default
  return render_template('index.html')

# This block ensures the development server runs only when the script is executed directly
# It will not run when imported into another script (like passenger_wsgi.py)
if __name__ == '__main__':
  # Run the Flask development server
  # debug=True enables debug mode, which provides helpful error messages
  # and automatically reloads the server when code changes.
  # IMPORTANT: Do NOT use debug=True in a production environment like FastComet.
  app.run(debug=True)
