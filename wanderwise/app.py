from flask import Flask, render_template, jsonify
import os

app = Flask(__name__, static_folder="assets", template_folder="templates")

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/createtrip")
def create_trip():
    return render_template("createtrip.html")

@app.route("/select-dates")
def select_dates():
    return render_template("select-dates.html")


@app.route("/plan")
def plan():
    return render_template("planpage.html")


@app.route("/selectplaces")
def select_places():
    return render_template("selectplaces.html")

@app.route("/itinerary")
def itinerary():
    return render_template("itinerary.html")

@app.route("/trips")
def trips():
    return render_template("trips.html")


@app.route("/get-api-key")
def get_api_key():
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        return jsonify({"error": "API key not found"}), 500
    return jsonify({"apiKey": api_key})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=True)
