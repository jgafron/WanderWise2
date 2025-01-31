from flask import Flask, render_template, request, redirect, url_for
from gb_backend.model_sqlite3 import Model

app = Flask(__name__)

@app.route("/")
def LandingPage():
    return render_template("index.html")

@app.route("/entries")
def EntriesPage():
    model = Model()
    entries = model.select()

    # Convert list of tuples into list of dictionaries
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

    return render_template("entries.html", entries=songs)


@app.route("/addentry")
def addEntryPage():
    return render_template("addentry.html")

@app.route("/addentry", methods=['POST'])
def add_entry():
    songtitle = request.form['song_title']
    genre = request.form['genre']
    artist = request.form['artist']
    release_date = request.form['release_date']
    lyrics = request.form['lyrics']
    rating = request.form['rating']
    url = request.form['url']

    model = Model()
    model.insert(songtitle, genre, artist, release_date, lyrics,rating,url)

    return redirect(url_for('EntriesPage'))


if __name__ == '__main__':
    app.run()