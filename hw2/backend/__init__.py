model_backend = 'sqlite3'
#model_backend = 'pylist'
#model_backend = 'mongodb'

if model_backend == 'sqlite3':
    from .model_sqlite3 import Model
#elif model_backend == 'pylist':
   # from .model_pylist import model
else:
    raise ValueError("No appropriate databackend configured. ")
