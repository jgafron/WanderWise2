import sqlite3
from google.cloud import datastore
from .Model import Model 
from datetime import date

class Model:
    def __init__(self):
        """
        Initializes the Datastore clinet
        """
        self.client = datastore.Client('cloud-gafron-jgafron')
    
    def from_datastore(self, entity):
        """Translates Datastore results into the format expected by the
        application.

        Datastore typically returns:
            [Entity{key: (kind, id), prop: val, ...}]

        This returns:
            [ name, email, date, message ]
        where name, email, and message are Python strings
        and where date is a Python datetime
        """
        if not entity:
            return None
        if isinstance(entity,list):
            entity = entity.pop()
        return [entity['title'],entity['genre'],entity['artist'],entity['release_date'], entity['lyrics'], entity['rating'], entity['url']]
    
    def select(self):
        """
        Retrieves all rows from the 'songs' table.
        :return: List of tuples containing all rows of the database.
        """
        query = self.client.query(kind = 'Song')
        entities = list(map(self.from_datastore, query.fetch()))
        return entities
    
    def insert(self,songtitle,genre,artist,release_date,lyrics,rating, url):
        key = self.client.key('Song')
        song = datastore.Entity(key)
        song.update({
            'title': songtitle,
            'genre' : genre,
            'artist' : artist,
            'release_date' : release_date,
            'lyrics' : lyrics,
            'rating' : rating,
            'url' : url
            })
        self.client.put(song)
        return True