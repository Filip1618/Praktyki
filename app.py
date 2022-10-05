from flask import Flask, render_template, redirect, url_for
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
    register_username = StringField(validators=[input_required()]) #Nie puste pole oraz nie może się powtarzać
    register_password = PasswordField(validators=[input_required()]) #Nie puste pole minimum 8 znaków, 1 litera duża, 1 mala, jedna cyfra (przynajmnie)
    register_firstname = StringField(validators=[input_required()]) #Nie puste pole
    register_lastname = StringField(validators=[input_required()]) #Nie puste pole

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

        if len(password) < amount_of_password_min:
            raise Exception("Hasło musi zawierać minimum 8 znaków")

        if len(password) > amount_of_password_max:
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



@app.route('/register', methods=['GET', 'POST'])
def register():

    register = Register_forms()

    if register.validate_on_submit():
        if register.validation():
            db.session.add(Users(username=register.register_username.data,
                            password=register.register_password.data,
                            lastname=register.register_lastname.data,
                            firstname=register.register_firstname.data))
            db.session.commit()
            return redirect(url_for('home'))

    return render_template('register.html', register=register)
  
if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)
