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

const arrayOfMovies = getResults("https://api.themoviedb.org/3/trending/all/day?api_key=87bf596c371c406133fdf1b253db9a36&language=pl");

const randomMovie = ReactDOM.createRoot(document.getElementById("randomMovie"));
randomMovie.render(<RenderRandomTrendMovie arrayOfMovies={arrayOfMovies} />);

const trendingMovies = ReactDOM.createRoot(document.getElementById("trendingMovies"));
trendingMovies.render(<RenderListOfTrends arrayOfMovies={arrayOfMovies} />);


function RenderListOfTrends(props) {
  const arrayOfMovies = props.arrayOfMovies;

  const renderedArray = arrayOfMovies.map((movie) => (
    <li key={movie.id}>
      <a href={`/${movie.media_type}/${movie.id}`}>
        <img src={`https://image.tmdb.org/t/p/original${movie.poster_path}`} />
        <p>{movie.title}</p>
      </a>
    </li>
  ));

  return (
    <>
      <h1>Trendujące dzisiaj</h1>
      <ul className="list--of--trends">
        {renderedArray}
      </ul>
    </>
  );
}


function RenderRandomTrendMovie(props) {
  const arrayOfMovies = props.arrayOfMovies;
  const randomInteger = Math.floor(Math.random() * 20);
  const movie = arrayOfMovies[randomInteger];

  return (
    <a href={`/${movie.media_type}/${movie.id}`}>
      <div className="trendingMovie">
        <h1>{movie.title}</h1>
        <img
          src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
        />
      </div>
    </a>
  );
}


function RenderSearchResults(props) {
  const arrayOfMovies = props.arrayOfMovies;
  const listOfSearchResults = arrayOfMovies.slice(0, 3).map((movie) => (

    <li key={movie.id} className="result">
      <a href={`/${movie.media_type}/${movie.id}`}>
        <img src={`https://image.tmdb.org/t/p/original${movie.poster_path}`} alt={movie.title}/>
        <div className="result--info">
          <h3>{movie.title}</h3>
          <p>
            {movie.overview == "" ? "Brak opisu :(" : `${movie.overview.substring(0, 240)}...`}
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


document.getElementById("mainContainer").addEventListener("click", () => {
  document.getElementById("searchArea").style.display = "none";
});

document.getElementById("searchBar").addEventListener("click", () => {
  document.getElementById("searchArea").style.display = "initial";
});


