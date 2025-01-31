import sqlite3
from .Model import Model 
from datetime import date

DB_FILE = 'songs.db'  # Database file name

class Model:
    def __init__(self):
        """
        Initializes the database connection and ensures the 'songs' table exists.
        If the table does not exist, it creates one.
        """
        connection = sqlite3.connect(DB_FILE)
        cursor = connection.cursor()
        try:
            cursor.execute("select count(song_title) from songs")  # Check if the table exists
        except sqlite3.OperationalError:
            # If the table doesn't exist, create it
            cursor.execute("""
                CREATE TABLE songs (
                    song_title TEXT, 
                    genre TEXT, 
                    artist TEXT, 
                    release_date DATE, 
                    lyrics TEXT, 
                    rating INT, 
                    url TEXT
                )
            """)
        cursor.close()
    
    def select(self):
        """
        Retrieves all rows from the 'songs' table.
        :return: List of tuples containing all rows of the database.
        """
        connection = sqlite3.connect(DB_FILE)
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM songs")  # Fetch all records from the table
        return cursor.fetchall()

    def insert(self, title, genre, artist, release_date, lyrics, rating, url):
        """
        Inserts a new song entry into the database.
        :param title: Song title (String)
        :param genre: Music genre (String)
        :param artist: Artist name (String)
        :param release_date: Release date (Date)
        :param lyrics: Lyrics of the song (String)
        :param rating: Rating of the song (Integer)
        :param url: URL linking to the song (String)
        :return: True if the insertion was successful.
        """
        params = {
            'title': title, 'genre': genre, 'artist': artist,
            'date': release_date, 'lyrics': lyrics,
            'rating': rating, 'url': url
        }
        connection = sqlite3.connect(DB_FILE)
        cursor = connection.cursor()
        cursor.execute("""
            INSERT INTO songs (song_title, genre, artist, release_date, lyrics, rating, url) 
            VALUES (:title, :genre, :artist, :date, :lyrics, :rating, :url)
        """, params)

        connection.commit()  # Save changes to the database
        cursor.close()
        return True
