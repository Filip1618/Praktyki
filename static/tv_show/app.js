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
  const movie = props.movie

  const json = JSON.stringify({'mediaType': 'serial', 'mediaID':  window.location.href.substring(29)})
  
  const getRatingPromise = new Promise((resolve, reject) => {
    $.ajax({
      url: "/getRating",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify(json),
      success: (result) => {
        resolve(result.average)
      },
      error: (error) => {
        reject(error)
      }
    });
  })

  getRatingPromise.then(average => {
    if (average == false) {
      $('#ratingAverage').append('<p class="with--no--rating">Film nieposiada ocen</p>')
    } else {
      const rounded = Math.round(average)

      for(var i = 0; i < rounded; i++){
        $('#ratingAverage').append('<p class="filled">☆</p>');   
      }
  
      for(var i = 0; i < 5 - rounded; i++){
        $('#ratingAverage').append('<p>☆</p>');   
      }
    }

  })





  return (
    <div className="backdrop">
      <div className="backdrop--info">
        <h1>{movie.title}</h1>
        <p>Serial</p>
        <p>{movie.first_air_date.slice(0,4)}</p>
        <div className='rating' id='ratingAverage'>
        </div>
      </div>
      <img
        src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
      />
    </div>
  );
}

function RenderMainInfo(props) {
  const movie = props.movie


  return(
    <div className="main--info">
      <p className="overview--alt">{movie.overview == "" ? "Brak opisu :(" : movie.overview}</p>
      <div className="container--info">
        <img src={`https://image.tmdb.org/t/p/original${movie.poster_path}`}/>
        <div className="info">
          <p className="overview">{movie.overview == "" ? "Brak opisu :(" : movie.overview}</p>
          <p>Pierwszy odcinek <h3>{movie.first_air_date}</h3></p>
          <p>Ostatni odcinek <h3>{movie.last_air_date == undefined ? "Ongoing" : movie.last_air_date}</h3></p>
          <p>Ilość sezonów <h3>{movie.number_of_seasons}</h3></p>
          <p>Ilość odcinków <h3>{movie.number_of_episodes}</h3></p>
          <p>Długość odcinka <h3>{movie.episode_run_time} min</h3></p>
        </div>
      </div>
    </div>
  )
}



var movieID = window.location.href.substring(28)
var movie = getJSON(`https://api.themoviedb.org/3/tv/${movieID}?api_key=87bf596c371c406133fdf1b253db9a36&language=pl`)


const backdrop = ReactDOM.createRoot(document.getElementById('backdrop'))
backdrop.render(<RenderBackdrop movie = {movie} />)

const mainInfo = ReactDOM.createRoot(document.getElementById('mainInfo'))
mainInfo.render(<RenderMainInfo movie = {movie}/>)



document.querySelectorAll('.confirm--button').forEach((confirmButton) => {
  confirmButton.addEventListener('click', () => {
    const reason = confirmButton.previousElementSibling.firstChild.nextElementSibling.value
    const commentID = confirmButton.value

    let json = JSON.stringify({'commentID': commentID, 'reason' : reason})
    $.ajax({
      url: "/hideComment",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify(json),
      success: () => {
        document.location.reload()
      }
    });

  })

})







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

