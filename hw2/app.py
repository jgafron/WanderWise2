from flask import Flask, render_template, request, redirect, url_for
from backend.model_sqlite3 import Model  # Import the database model for handling song entries

app = Flask(__name__)  # Initialize the Flask application

@app.route("/")
def LandingPage():
    """
    Route for the landing page.
    Renders the 'index.html' template when a user visits the root URL.
    """
    return render_template("index.html")

@app.route("/entries")
def EntriesPage():
    """
    Route to display all song entries.
    Fetches all song records from the database and passes them to 'entries.html' for rendering.
    """
    model = Model()  # Create an instance of the database model
    entries = model.select()  # Retrieve all song entries from the database

    # Convert list of tuples into a list of dictionaries for easy template rendering
    songs = [
        {
            "title": entry[0], 
            "genre": entry[1], 
            "artist": entry[2], 
            "release_date": entry[3], 
            "lyrics": entry[4], 
            "rating": entry[5], 
            "url": entry[6]  # Assuming this is the song image URL
        }
        for entry in entries
    ]

    return render_template("entries.html", entries=songs)  # Pass the song data to the template

@app.route("/addentry")
def addEntryPage():
    """
    Route to display the form for adding a new song entry.
    Renders 'addentry.html'.
    """
    return render_template("addentry.html")

@app.route("/addentry", methods=['POST'])
def add_entry():
    """
    Handles form submission for adding a new song entry.
    Extracts form data, saves it to the database, and redirects to the entries page.
    """
    songtitle = request.form['song_title']
    genre = request.form['genre']
    artist = request.form['artist']
    release_date = request.form['release_date']
    lyrics = request.form['lyrics']
    rating = request.form['rating']
    url = request.form['url']

    model = Model()  # Create an instance of the database model
    model.insert(songtitle, genre, artist, release_date, lyrics, rating, url)  # Insert new entry

    return redirect(url_for('EntriesPage'))  # Redirect to the entries page after submission

if __name__ == '__main__':
    app.run()  # Run the Flask application
