from flask import Flask, render_template, redirect, url_for, request, json, jsonify, abort
from wtforms import (StringField, SubmitField, PasswordField, RadioField)
from flask_wtf import FlaskForm
from wtforms.validators import input_required
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin, LoginManager, login_user, logout_user, current_user
from dotenv import load_dotenv
from os import getenv
from flask_bcrypt import Bcrypt
from datetime import datetime
from sqlalchemy import Column, Integer, DateTime, Boolean
from sqlalchemy.ext.declarative import declarative_base


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

def user_id_to_username(user_id):
    username = Users.query.filter_by(id = user_id).first().username
    return username


app.jinja_env.globals.update(user_id_to_username=user_id_to_username)


class Users(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key = True)
    username = db.Column(db.String(32), nullable=False, unique=True)
    password = db.Column(db.String(64), nullable=False, unique=False)
    firstname = db.Column(db.String(32),nullable=False, unique=False)
    lastname = db.Column(db.String(32), nullable=False, unique=False)
    is_admin = db.Column(db.Boolean, nullable=False, default=False, unique=False)



class Comments(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    content = db.Column(db.String(256), nullable=False, unique=False)
    date = db.Column(db.DateTime, nullable=False, unique=False, default=datetime.utcnow)
    rate =  db.Column(db.Integer, nullable=False, unique=False)
    user_id = db.Column(db.Integer, nullable=False, unique=False)
    is_hidden = db.Column(db.Boolean, nullable=False, default=False, unique=False)
    ban_reason = db.Column(db.String(256), nullable = True, unique = False)
    media_type = db.Column(db.String(16), nullable=False, unique=False)
    media_id = db.Column(db.Integer, nullable=False, unique=False)



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


class Comments_forms(FlaskForm):
    comment_submit = SubmitField("Skomentuj")
    comment_stringfield = StringField(validators=[input_required()])
    def validate(self):
        if len(self.comment_stringfield.data) < 1:
            raise Exception("Komentarz nie może być pusty")
        return True

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


@app.route("/serial/<tv_show_id>", methods = ['GET', 'POST'])
def tv_show_template(tv_show_id):
    comment_forms = Comments_forms()

    if comment_forms.validate_on_submit() and current_user.is_authenticated:
        new_comment = Comments(content = comment_forms.comment_stringfield.data, rate=request.form['comment_radio_field'], 
                                user_id = current_user.id, media_type="serial", media_id = tv_show_id)
        db.session.add(new_comment)
        db.session.commit()
        return redirect(f"/serial/{tv_show_id}")

    comment_already_uploaded = None
    list_of_comments = Comments.query.filter_by(media_type = "serial", media_id = tv_show_id)
    if current_user.is_authenticated:
        if_user_uploaded_comment = Comments.query.filter_by(media_type = "serial", media_id = tv_show_id, user_id = current_user.id).first()
        if if_user_uploaded_comment:
            comment_already_uploaded = True
        else:
            comment_already_uploaded = False

    return render_template('tv_show_template.html', tv_show_id = tv_show_id, comment_forms=comment_forms,
                            list_of_comments = list_of_comments, comment_already_uploaded = comment_already_uploaded)


@app.route('/film/<movie_id>', methods=['GET', 'POST'])
def movie_template(movie_id):
    comment_forms = Comments_forms()

    if comment_forms.validate_on_submit() and current_user.is_authenticated:
        new_comment = Comments(content = comment_forms.comment_stringfield.data, rate=request.form['comment_radio_field'], 
                                user_id = current_user.id, media_type="film", media_id = movie_id)
        db.session.add(new_comment)
        db.session.commit()
        return redirect(f"/film/{movie_id}")

    comment_already_uploaded = None
    list_of_comments = Comments.query.filter_by(media_type = "film", media_id = movie_id)
    if current_user.is_authenticated:
        if_user_uploaded_comment = Comments.query.filter_by(media_type = "film", media_id = movie_id, user_id = current_user.id).first()
        if if_user_uploaded_comment:
            comment_already_uploaded = True
        else:
            comment_already_uploaded = False

    return render_template('movie_template.html', movie_id = movie_id, comment_forms=comment_forms,
                            list_of_comments = list_of_comments, comment_already_uploaded = comment_already_uploaded)

@app.route('/admin_panel', methods=['GET', 'POST'])
def admin_panel():

    comments = Comments.query.all()

    return render_template('admin_panel.html', comments = comments)


@app.route('/hideComment', methods=['POST'])
def hideComment():
    if request.method == 'POST':
        result = json.loads(request.get_json())

        comment = Comments.query.filter_by(id=result['commentID']).first()
        comment.is_hidden = True
        comment.ban_reason = result['reason']
        db.session.commit()

        return jsonify({'success': True})

@app.route('/deleteComment', methods=['POST'])
def deleteComment():
    if current_user.is_admin == True:
        results = json.loads(request.get_json())

        comment_id = results.get('commentID')

        Comments.query.filter_by(id = comment_id).delete()
        db.session.commit()

        return jsonify({'success': True})

@login_manager.user_loader
def load_user(user_id):
    return Users.query.get(int(user_id))


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)
