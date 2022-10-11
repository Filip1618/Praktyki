jQuery.extend({

  getJSON: function(url) {
      var result = null;

      $.ajax({
          url: url,
          type: 'get',
          dataType: 'json',
          async: false,
          success: function(data) {
              result = data;
          }
      });
      
     return result;
  }

});



const getResults = (url) => {

  const json = $.getJSON(url)
  const results = json.results

  results.forEach(movie => {

    if (movie.title == undefined){
      movie.title = movie.name
      delete movie.name
    }

  })

  return results
}



function RenderListOfTrends(props) {

const arrayOfMovies = props.arrayOfMovies;

const renderedArray = arrayOfMovies.map((movie) => 
  <li key={movie.id}>
    <a href={movie.id}>
      <img src={`https://image.tmdb.org/t/p/original${movie.poster_path}`}/>
      <p>{movie.title}</p>
    </a>
  </li>
);

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
  const movie = arrayOfMovies[randomInteger]
  
  return (
    <a href={movie.id}>
      <div className="trendingMovie">
        <h1>{movie.title}</h1>
        <img src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}/>
      </div>
    </a>
  );
  
}

function RenderSearchResults(props) {

  const arrayOfMovies = props.arrayOfMovies
  const listOfSearchResults = arrayOfMovies.slice(0, 3).map((movie) => 
    <li key={movie.id}>
      <a href={movie.id}>
        <img src={`https://image.tmdb.org/t/p/original${movie.poster_path}`} alt={movie.title}/>
        <div className='container--info'>
          <h3>{movie.title}</h3>
          <p>{movie.overview == "" ? "Brak opisu :(" : `${movie.overview.substring(0,240)}...`}</p>
        </div>
      </a>
    </li>
  )


  return(
    <ul className="list--of--results">
      {listOfSearchResults}
      <a>Pokaż wiecej wyników</a>
    </ul>
  )

}



const arrayOfMovies = getResults('https://api.themoviedb.org/3/trending/all/day?api_key=87bf596c371c406133fdf1b253db9a36&language=pl')

const randomMovie = ReactDOM.createRoot(document.getElementById("randomMovie"))
randomMovie.render(<RenderRandomTrendMovie arrayOfMovies={arrayOfMovies}/>)

const trendingMovies = ReactDOM.createRoot(document.getElementById('trendingMovies'))
trendingMovies.render(<RenderListOfTrends arrayOfMovies={arrayOfMovies}/>)


const searchArea = ReactDOM.createRoot(document.getElementById("searchArea"))
document.getElementById('searchBar').addEventListener('input', () => {

  var url = (`https://api.themoviedb.org/3/search/movie?api_key=87bf596c371c406133fdf1b253db9a36&language=pl&page=1&include_adult=false&query=${document.getElementById('searchBar').value}`)
  const listOfResults = getResults(url)

  searchArea.render(<RenderSearchResults arrayOfMovies={listOfResults}/>)

})

document.getElementById('mainContainer').addEventListener('click', () => {
  document.getElementById('searchArea').style.display = 'none'
})

document.getElementById('searchBar').addEventListener('click', () => {
  document.getElementById('searchArea').style.display = 'initial'
})


