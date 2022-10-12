jQuery.extend({
  getJSON: function (url) {
    var result = null;

    $.ajax({
      url: url,
      type: "get",
      dataType: "json",
      async: false,
      success: function (data) {
        result = data;
      },
    });

    return result;
  },
});


const getResults = (url) => {
  if (url.search('3/search/tv?') != -1){
    var media_type = 'serial'
  } else if(url.search('3/search/movie?') != -1) {
    var media_type  = 'film'
  }

  const json = $.getJSON(url);
  var results = json.results;


  results.forEach((movie) => {
    if (movie.title == undefined) {
      movie.title = movie.name;
      delete movie.name;
    }

    if (movie.media_type == undefined){
      movie.media_type = media_type
    }

    if (movie.media_type == 'tv') {
      movie.media_type = 'serial';
    } else if(movie.media_type == 'movie'){
      movie.media_type = 'film'
    }
  });

  return results;
};

const getJSON = (url) => {
  if (url.search('/3/tv/') != -1){
    var media_type = 'serial'
  } else if(url.search('/3/movie/') != -1) {
    var media_type  = 'film'
  }

  const json = $.getJSON(url);

  if (json.title == undefined){
    json.title = json.name
    delete json.name
  }

  json.media_type = media_type

  return json;
};

function RenderBackdrop(props){
  const movieID = props.movieID

  var movie = getJSON(`https://api.themoviedb.org/3/tv/${movieID}?api_key=87bf596c371c406133fdf1b253db9a36&language=pl`)

  return (
      <div className="backdrop">
        <div className="backdrop--info">
          <h1>{movie.title}</h1>
          <p>Serial</p>
          <p>{movie.first_air_date.slice(0,4)}</p>
        </div>
        <img
          src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
        />
    </div>
  );
}

function RenderMainInfo(props) {
  const movieID = props.movieID

  var movie = getJSON(`https://api.themoviedb.org/3/tv/${movieID}?api_key=87bf596c371c406133fdf1b253db9a36&language=pl`)

  return(
    <div className="main--info">
      <img src={`https://image.tmdb.org/t/p/original${movie.poster_path}`}/>
      <div className="info">
        <p>{movie.overview == "" ? "Brak opisu :(" : movie.overview}</p>
        <p>Pierwszy odcinek <h3>{movie.first_air_date}</h3></p>
        <p>Ostatni odcinek <h3>{movie.last_air_date == undefined ? "Ongoing" : movie.last_air_date}</h3></p>
        <p>Ilość sezonów <h3>{movie.number_of_seasons}</h3></p>
        <p>Ilość odcinków <h3>{movie.number_of_episodes}</h3></p>
        <p>Długość odcinka <h3>{movie.episode_run_time} min</h3></p>
      </div>
    </div>
  )
}

const movieID = window.location.href.substring(28)

const backdrop = ReactDOM.createRoot(document.getElementById('backdrop'))
backdrop.render(<RenderBackdrop movieID = {movieID} />)

const mainInfo = ReactDOM.createRoot(document.getElementById('mainInfo'))
mainInfo.render(<RenderMainInfo movieID = {movieID}/>)







function RenderSearchResults(props) {
  const arrayOfMovies = props.arrayOfMovies;
  const listOfSearchResults = arrayOfMovies.slice(0, 3).map((movie) => (

    <li key={movie.id}>
      <a href={`/${movie.media_type}/${movie.id}`}>
        <img
          src={`https://image.tmdb.org/t/p/original${movie.poster_path}`}
          alt={movie.title}
        />
        <div className="container--info">
          <h3>{movie.title}</h3>
          <p>
            {movie.overview == ""
              ? "Brak opisu :("
              : `${movie.overview.substring(0, 240)}...`}
          </p>
        </div>
      </a>
    </li>
  ));

  return (
    <ul className="list--of--results">
      {listOfSearchResults}
      <a>Pokaż wiecej wyników</a>
    </ul>
  );
}


function searchMovieOrTvShow() {
  var movieURL = `https://api.themoviedb.org/3/search/movie?api_key=87bf596c371c406133fdf1b253db9a36&language=pl&page=1&include_adult=false&query=${
    document.getElementById("searchBar").value
  }`;

  var tvShowURL = `https://api.themoviedb.org/3/search/tv?api_key=87bf596c371c406133fdf1b253db9a36&language=pl&page=1&include_adult=false&query=${
    document.getElementById("searchBar").value
  }`;

  const arrayOfMovies = getResults(movieURL);
  const arrayOfTvShows = getResults(tvShowURL);
  const moviesAndTVshows = arrayOfTvShows.concat(arrayOfMovies);
  const sortedList = moviesAndTVshows.sort(compareList).reverse();
  
  function compareList(a, b) {
    return a.popularity - b.popularity;
  }

  searchArea.render(<RenderSearchResults arrayOfMovies={sortedList} />);
}


const searchArea = ReactDOM.createRoot(document.getElementById("searchArea"));
var timer;
const searchBar = document.getElementById("searchBar");
searchBar.addEventListener("input", () => {
  clearTimeout(timer);
  timer = setTimeout(searchMovieOrTvShow, 1000);
});



document.getElementById("mainContainer").addEventListener("click", () => {
  document.getElementById("searchArea").style.display = "none";
});

document.getElementById("searchBar").addEventListener("click", () => {
  document.getElementById("searchArea").style.display = "initial";
});

