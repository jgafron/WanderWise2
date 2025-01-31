import sqlite3
import os

DB_FILE = 'entries.db' 

class Model:
    def __init__(self):
        self.connection = sqlite3.connect(DB_FILE)

    def select(self):
        """
        Gets all rows from the database
        :return: List of lists containing all rows of database
        """
        cursor = self.connection.cursor()
        cursor.execute("SELECT * FROM songs") 
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
        :param rating: Integer (1 to 5 or any other scale)
        :param url: String (URL of the song)
        :return: True if successful, else False
        """
        params = {
            'title': title, 'genre': genre, 'artist': artist,
            'writer': writer, 'date': release_date, 'lyrics': lyrics,
            'rating': rating, 'url': url
        }
        cursor = self.connection.cursor()
        cursor.execute("""
            INSERT INTO songs (song_title, genre, performer, songwriter, release_date, lyrics, rating, url) 
            VALUES (:title, :genre, :artist, :writer, :date, :lyrics, :rating, :url)
        """, params)

        self.connection.commit()
        cursor.close()
        return True

    def create_table(self):
        """
        Creates the database table if it doesn't already exist
        """
        if not os.path.exists(DB_FILE):
            conn = sqlite3.connect(DB_FILE)
            cursor = conn.cursor()

            cursor.execute('''
            CREATE TABLE IF NOT EXISTS songs (
                song_id INTEGER PRIMARY KEY AUTOINCREMENT,
                song_title TEXT NOT NULL,
                genre TEXT,
                performer TEXT,
                songwriter TEXT,
                release_date TEXT,
                lyrics TEXT,
                rating INTEGER,
                url TEXT
            )
            ''')

            conn.commit()
            conn.close()
            print(f"Database '{DB_FILE}' and table created successfully.")
        else:
            print(f"Database '{DB_FILE}' already exists.")

model = Model()
model.create_table() 
