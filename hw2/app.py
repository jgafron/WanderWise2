from flask import Flask, render_template

app = Flask(__name__)

@app.route("/")
def LandingPage():
    return render_template("index.html")

@app.route("/entries")
def EntriesPage():
    return render_template("entries.html")

if __name__ == '__main__':
    app.run()