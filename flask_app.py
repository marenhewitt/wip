from flask import Flask, redirect, render_template
import weatherdata

app = Flask(__name__)

@app.route('/')
def get_weather_data():
    return weatherdata