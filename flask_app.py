from flask import Flask, redirect, request, render_template, jsonify, make_response, session
from flask_session import Session
import firebase_admin
from firebase_admin import credentials, firestore, messaging
import weatherdata

cred = credentials.Certificate('weatherinsiderprep-firebase-adminsdk.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

app = Flask(__name__)
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = 'filesystem'
Session(app)

def auto_login():
    cookie = request.cookies.get('remember')
    if cookie is None: return False

    remember_ref = db.collection('Remember').document(cookie).get()
    if not remember_ref.exists: return False

    remember_data = remember_ref.to_dict()
    
    user_ref = db.collection('users').where('email', '==', remember_data['email']).limit(1).get()
    if not user_ref: return False
    
    user_data = user_ref[0].to_dict()
    session['email'] = user_data['email']
    session['username'] = user_data.get('displayName', 'User')

    return True

def is_logged_in():
    if not session.get('email'):
        return auto_login()
    return True

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/index.html')
def index():
    return render_template('index.html')

@app.route('/login.html')
def login():
    if request.method == 'GET':
        if is_logged_in(): return redirect('/index.html')
        return render_template('login.html')
    
    # Handle the "Remember Me" logic via POST if needed
    response = make_response(jsonify({'result': 'OK'}))
    remember = request.args.get('remember', 'no')
    email = request.args.get('email') # Ensure email is passed from frontend

    if remember == 'no':
        response.delete_cookie('remember')
    elif email:
        # Generate a simple key (or use a UUID)
        import uuid
        key = str(uuid.uuid4())
        db.collection('Remember').document(key).set({'email': email})
        response.set_cookie('remember', key, max_age=60*60*24*14)

    return response

@app.route('/profile.html')
def profile():
    return render_template('profile.html')

@app.route('/createaccount.html')
def create_account():
    return render_template('createaccount.html')

@app.route('/logout.html')
def logout():
    session.clear()
    response = make_response(redirect('/login.html'))
    response.delete_cookie('remember')
    return response

@app.route('/get_weather')
def get_weather():
    zip_code = request.args.get('zip')
    data = weatherdata.get_weather(zip_code)
    return jsonify(data)

#notifs
def send_daily_notification(token, weather_summary):
    message = messaging.Message(
        notification=messaging.Notification(
            title='Your Daily Weather Update',
            body=f"Today's forecast: {weather_summary}",
        ),
        token=token,
    )
    response = messaging.send(message)
    print('Successfully sent message:', response)

@app.route('/firebase-messaging-sw.js')
def service_worker():
    return app.send_static_file('firebase-messaging-sw.js')

if __name__ == '__main__':
    app.run(debug=True)