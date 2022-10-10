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



const getArrayOfTrendingMovies = () => {

const json = $.getJSON('https://api.themoviedb.org/3/trending/all/day?api_key=87bf596c371c406133fdf1b253db9a36&language=pl')
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

return (<ul>{renderedArray}</ul>);

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







const arrayOfMovies = getArrayOfTrendingMovies()

const randomMovie = ReactDOM.createRoot(document.getElementById("randomMovie"))
randomMovie.render(<RenderRandomTrendMovie arrayOfMovies={arrayOfMovies}/>)
