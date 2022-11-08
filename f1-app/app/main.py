# 
from flask import Flask, request, render_template, redirect, jsonify
from werkzeug.exceptions import default_exceptions
from dotenv import dotenv_values
from logging.config import dictConfig
import logging
from pathlib import Path
import os 

# Get environment variables 
NEO_URI = os.environ.get("NEO_URI")
NEO_USER = os.environ.get("NEO_USER")
NEO_PW = os.environ.get("NEO_PW")

# Configure application
app = Flask(__name__)

# Ensure templates are auto-reloaded
app.config["TEMPLATES_AUTO_RELOAD"] = True


@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "GET":
        return render_template("index.html")    
    else:
        form = request.form
        print(form)
        jsdata = request.json   
        print(jsdata)
        return render_template('index.html')

# Handle random domains apologies 
def errorhandler(e):
    """Handle error"""
    return apology(e.name, e.code)


# listen for errors
for code in default_exceptions:
    app.errorhandler(code)(errorhandler)


def apology(message, code=400):
    """Render message as an apology to user."""
    def escape(s):
        """
        Escape special characters.

        https://github.com/jacebrowning/memegen#special-characters
        """
        for old, new in [("-", "--"), (" ", "-"), ("_", "__"), ("?", "~q"),
                         ("%", "~p"), ("#", "~h"), ("/", "~s"), ("\"", "''")]:
            s = s.replace(old, new)
        return s
    return render_template("apology.html", top=code, bottom=escape(message)), code


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8080, debug=True)