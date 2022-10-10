from flask import Flask, render_template, redirect, url_for, request
from wtforms import (StringField, SubmitField, PasswordField)
from flask_wtf import FlaskForm
from wtforms.validators import input_required
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin, LoginManager, login_user, logout_user
from dotenv import load_dotenv
from os import getenv
from flask_bcrypt import Bcrypt


load_dotenv()
DATABASE_USERNAME=getenv('DATABASE_USERNAME')
DATABASE_PASSWORD=getenv('DATABASE_PASSWORD')
DATABASE_URL=getenv('DATABASE_URL')
DATABASE_NAME=getenv('DATABASE_NAME')
APP_KEY=getenv('APP_KEY')


app = Flask(__name__)
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
login_manager = LoginManager()


app.config['SQLALCHEMY_DATABASE_URI'] = f'mysql+pymysql://{DATABASE_USERNAME}:{DATABASE_PASSWORD}@{DATABASE_URL}/{DATABASE_NAME}'
app.config['SECRET_KEY'] = APP_KEY


login_manager.init_app(app)
login_manager.login_view = 'login'


class Users(db.Model, UserMixin):
	id = db.Column(db.Integer, primary_key = True)
	username = db.Column(db.String(32), nullable=False, unique=True)
	password = db.Column(db.String(64), nullable=False, unique=False)
	firstname = db.Column(db.String(32),nullable=False, unique=False)
	lastname = db.Column(db.String(32), nullable=False, unique=False)

class Register_forms(FlaskForm):
    register_submit = SubmitField()
    register_username = StringField(validators=[input_required()]) 
    register_password = PasswordField(validators=[input_required()])
    register_firstname = StringField(validators=[input_required()])
    register_lastname = StringField(validators=[input_required()]) 

    def validation(self):
        username = self.register_username.data
        firstname = self.register_firstname.data
        lastname = self.register_lastname.data
        password = self.register_password.data

        characters_max = 32
        characters_min = 1
        username_min = 3
        username_max = 32
        password_min = 8
        password_max = 64

        if len(password) < password_min:
            raise Exception("Hasło musi zawierać minimum 8 znaków")

        if len(password) > password_max:
            raise Exception("Hasło nie moze zawierać więcej niż 64 znaki")

        if len(firstname) < characters_min or len(lastname) < characters_min:
            raise Exception("Imię lub nazwisko nie spełnia minimalnych wymagań")

        if len(firstname) > characters_max or len(lastname) > characters_max:
            raise Exception("Imię lub nazwisko posiada za dużo znaków")

        if len(username) < username_min:
            raise Exception("Nazwa użytkownika jest zbyt krótka")
        
        if len(username) > username_max:
            raise Exception("Nazwa użytkownika jest zbyt długa")

        if_exists = Users.query.filter_by(username = username).first()
        if if_exists:
            raise Exception("Taki użytkownik już istnieje")

        if password == password.upper():
            raise Exception("Hasło nie ma małych liter")

        if password == password.lower():
            raise Exception("Hasło nie ma dużych liter")

        if not any(char.isdigit() for char in password):
            raise Exception("Hasło nie zawiera przynajmniej 1 cyfry")

        return True

class Login_forms(FlaskForm):
    login_username = StringField(validators=[input_required()])
    login_password = PasswordField(validators=[input_required()])
    login_submit = SubmitField()


@app.route('/')
@app.route('/home')
def home():
	return render_template('home.html')


@app.route('/register', methods=['GET', 'POST'])
def register():

    register = Register_forms()

    if register.validate_on_submit():
        if register.validation():
            hashed_password = bcrypt.generate_password_hash(register.register_password.data)
            db.session.add(Users(username=register.register_username.data,
                            password=hashed_password,
                            lastname=register.register_lastname.data,
                            firstname=register.register_firstname.data))
            db.session.commit()
            return redirect(url_for('home'))

    return render_template('register.html', register=register)


@app.route("/login", methods=['GET', 'POST'])
def login():
    login = Login_forms()
    if request.method == "POST":
        username = login.login_username.data
        password = login.login_password.data
        user = Users.query.filter_by(username=username).first()

        if user and bcrypt.check_password_hash(user.password, login.login_password.data):
            login_user(user)
            return redirect(url_for("home"))
        else:
            raise Exception("Hasło lub nazwa użytkownika jest błędna")

    return render_template('login.html', login=login)


@app.route("/logout")
def logout():
    logout_user()
    return redirect(url_for('home'))


@login_manager.user_loader
def load_user(user_id):
    return Users.query.get(int(user_id))


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)
