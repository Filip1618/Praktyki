from flask import Flask, render_template
from wtforms import (StringField, SubmitField, PasswordField)
from flask_wtf import FlaskForm
from wtforms.validators import input_required
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
from os import getenv
app = Flask(__name__)
db = SQLAlchemy(app)


load_dotenv()
DATABASE_USERNAME=getenv('DATABASE_USERNAME')
DATABASE_PASSWORD=getenv('DATABASE_PASSWORD')
DATABASE_URL=getenv('DATABASE_URL')
DATABASE_NAME=getenv('DATABASE_NAME')

APP_KEY=getenv('APP_KEY')

app.config['SQLALCHEMY_DATABASE_URI'] = f'mysql+pymysql://{DATABASE_USERNAME}:{DATABASE_PASSWORD}@{DATABASE_URL}/{DATABASE_NAME}'
app.config['SECRET_KEY'] = APP_KEY



class Users(db.Model):
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


class Login_forms(FlaskForm):
    login_username = StringField()
    login_password = PasswordField()
    login_submit = SubmitField()


@app.route('/test')
def test():
	user = Users.query.filter_by(firstname = "Majkel", username = "Majkel2").first()
	print(user.firstname)
	print(user.password)
	return render_template('test.html')



@app.route('/')
@app.route('/home')
def home():
	return render_template('home.html')


@app.route('/login', methods=['GET', 'POST'])
def login():

    login = Login_forms()
    register = Register_forms()

    if register.validate_on_submit():
        db.session.add(Users(username=register.register_username.data,
                        password=register.register_password.data,
                        lastname=register.register_lastname.data,
                        firstname=register.register_firstname.data))
        db.session.commit()

    return render_template('login.html', login=login, register=register)
  
if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)
