

# Opis aplikacji

Spotlight of the movies jest to aplikacja webowa umożliwiająca użytkownikom śledzenie kinowych nowości oraz ocenianie, komentowanie filmów lub seriali.

Aplikacja została napisana w języku python w wersji 3.8.8 zalecane jest używanie tej wersji lub nowszej. Używaną bazą danych jest MySQL.


# Instalacja

1. **Potrzebne biblioteki python'a**

   - Flask v.2.0.3
   - Flask-WTF v.1.0.1
   - Flask-SQLAlchemy v.2.5.1
   - Flask-Login v.0.6.1
   - Flask-Bcrypt v.1.0.1
   - WTForms v.3.0.1
   - python-dotenv v.0.21.0
   - SQLAlchemy v.1.4.37

   _(Wszystkie powyżej podane wersje biblitek są użyte w stabilnej wersji aplikacji zalecane jest użycie tych samych wersji lub nowszych)_

2. **Zmienne środowiskowe**

   - ```DATABASE_USERNAME``` Nazwa użytkownika bazy dasnych MySQL
   - `DATABASE_PASSWORD` Hasło użytkownika MySQL
   - `DATABASE_URL` URL do bazy danych
   - `DATABASE_NAME` Nazwa bazy danych
   - `APP_KEY` Klucz służący do szyfrowania danych przez Bcrypt

3. **Stworzenie wszystkich potrzebnych tabeli w bazie danych**
   - Przejście do folderu z plikiem "app.py" w konsoli
   - Przełączenie się na powłokę python'a: `python`
   - Zimportowanie objektu `db` z pliku app.py `from app import db`
   - Stworzenie wszystkich tabeli oraz zawartych w nich kolumn według schematu `db.create_all()`

# Informacje
1. **Struktura bazy danych**
   - Users
     - `id` - _int AI PK_
     - `username` - _varchar(32)_ **Nazwa użytkownika**
     - `password` - _varchar(64)_ **Hasło użytkownika**
     - `firstname` - _varchar(32)_ **Imię użytkownika**
     - `lastname` - _varchar(32)_ **Nazwisko użytkownika**
     - `is_admin` - _tinyint(1)_ **Wartość boolean która definiuje czy użytkownik posiada prawa administratora.**

   - Comments
     - id - _int AI PK_
     - content - _varchar(256)_ **Treść komentarza**
     - date - _datetime_ **Data dodania komentarza**
     - rate - _int_ **Ocena**
     - user_id - _int_ **ID użytkownika który dodał komentarz**
     - is_hidden - _tinyint(1)_ **Wartość boolean która określa czy komentarz został ukryty przez administratora**
     - ban_reason - _varchar(256)_ **Powód ukrycia komentarza przez administratora**
     - media_type - _varchar(16)_ **Wartość określa czy komentarz został zamieszczony pod filmem czy serialem**
     - media_id - _int_ **ID filmu lub serialu pod którym został zamieszczony komentarz**

2. **Endpointy**
   - **_/home_** Strona główna wyświetlają się na niej informacje o najnowszysch produkcjach.
   - **_/register_** Strona umożliwia tworzenie nowego konta użytkownika.
   - **_/login_** Strona umożliwia zalogowanie się na istniejące już konto.
   - **_/logout_** Strona umożliwia wylogowanie się z obecnie używanego konta.
   - **_/serial/<tv_show_id>_** Strona jest renderowana automatycznie w zalerzności jakie ID podamy w polu `tv_show_id` wyświetlają się na niej informacje o serialu oraz zamieszczone przez użytkowników oceny i komentarze, użytkownicy zalogowani mogą zamieścić swoją własną ocenę lub/i komentarz.
   - **_/film/<movie_id>_** Strona jest renderowana automatycznie w zalerzności jakie ID podamy w polu `movie_id` wyświetlają się na niej informacje o serialu oraz zamieszczone przez użytkowników oceny i komentarze, użytkownicy zalogowani mogą zamieścić swoją własną ocenę lub/i komentarz.
   - **_/admin_panel_** Endpoint jest dostępny tylko dla osób które są zalogowane na konto administratora, po wejściu na niego wczytane zostane wszystkie komentarze które można z odzielna usunąć lub ukryć.
   - **_/hideComment_** Jest to endpoint na który zostaje wysłany request typu POST w celu ukrycia komentarza.
   - ***/deleteComment*** Jest to endpoint na który zostaje wysłany request typu POST w celu usunięcia komentarza.
   - ***/getRating*** Endpoint zwraca JSON'a z liczbą określającą średnią ocen pod danym filmem lub serialem.

