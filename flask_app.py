from flask import Flask, redirect, request, render_template, jsonify
import weatherdata

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/index.html')
def index():
    return render_template('index.html')

@app.route('/login.html')
def login():
    return render_template('login.html')

@app.route('/profile.html')
def profile():
    return render_template('profile.html')

@app.route('/createaccount.html')
def create_account():
    return render_template('createaccount.html')

@app.route('/get_weather')
def get_weather():
    zip_code = request.args.get('zip')
    data = weatherdata.get_weather(zip_code)
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)