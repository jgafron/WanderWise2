from flask import Flask, render_template

app = Flask(__name__, static_folder="assets", template_folder="templates")

@app.route("/")
def home():
    return render_template("index.html")


@app.route("/plan")
def plan():
    return render_template("planpage.html")

@app.route("/createtrip")
def plan():
    return render_template("createtrip.html")


if __name__ == "__main__":
    app.run(debug=True)
