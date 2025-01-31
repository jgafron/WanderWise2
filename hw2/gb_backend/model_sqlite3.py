import sqlite3
from .Model import Model
from datetime import date

DB_FILE = 'songs.db' 

class Model:
    def __init__(self):
        connection = sqlite3.connect(DB_FILE)
        cursor = connection.cursor()
        try:
            cursor.execute("select count(song_title) from songs")
        except sqlite3.OperationalError:
            cursor.execute("create table songs (song_title text, genre text,artist text,release_date date,lyrics text, rating int, url text)")
        cursor.close()
    
    def select(self):
        """
        Gets all rows from the database
        :return: List of lists containing all rows of database
        """
        connection = sqlite3.connect(DB_FILE)
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM songs") 
        return cursor.fetchall()

    def insert(self, title, genre, artist, release_date, lyrics, rating, url):
        """
        Inserts entry into database
        :param title: String
        :param genre: String
        :param artist: String
        :param release_date: Date
        :param lyrics: String
        :param rating: Integer (1 to 5 or any other scale)
        :param url: String (URL of the song)
        :return: True if successful, else False
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

        connection.commit()
        cursor.close()
        return True
