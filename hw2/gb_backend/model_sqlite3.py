from datetime import date
from .Model import Model
import sqlite3

DB_FILE = 'entries.db'  # Use your existing database

class model(Model):
    def __init__(self):
        self.connection = sqlite3.connect(DB_FILE)

    def select(self):
        """
        Gets all rows from the database
        :return: List of lists containing all rows of database
        """
        connection = sqlite3.connect(DB_FILE)
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM entries")  # Ensure this matches your table name
        return cursor.fetchall()

    def insert(self, title, genre, artist, writer, release_date, lyrics, rating, url):
        """
        Inserts entry into database
        :param title: String
        :param genre: String
        :param artist: String
        :param writer: String
        :param release_date: Date
        :param lyrics: String
        :param rating: Float
        :param url: String
        :return: True
        """
        params = {
            'title': title, 'genre': genre, 'artist': artist,
            'writer': writer, 'date': release_date, 'lyrics': lyrics,
            'rating': rating, 'url': url
        }
        connection = sqlite3.connect(DB_FILE)
        cursor = connection.cursor()
        cursor.execute("""
            INSERT INTO entries (song_title, genre, artist, writer, release_date, lyrics, rating, url) 
            VALUES (:title, :genre, :artist, :writer, :date, :lyrics, :rating, :url)
        """, params)

        connection.commit()
        cursor.close()
        return True
