import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Button from "./Button";
import { Link } from "react-router-dom";
import { getMovies } from "../functionality/movie";

const MovieDetails = () => {
  const { movieId } = useParams();
  const [movie, setMovie] = useState(null);
  const [hasReviews, setHasReviews] = useState(false);

  useEffect(() => {
    getMovies().then((data) => {
      console.log(data);
      data.forEach(element => {
        if (element.movie_id == movieId) {
          setMovie(element);
        }
        if (element.review1) {
          setHasReviews(true);
        }
      });
    })
  }, [movieId]);


  return (
    <div>
      {movie ? (
        <div>
          <h1>{movie.movie_title}</h1>
          <img src={movie.picture} alt={movie.movie_title} />
          <p>{movie.synopsis}</p>
          <p>Director: {movie.director}</p>
          <p>Producer: {movie.producer}</p>
          <p>Cast: {movie.cast}</p>
          <p>Category: {movie.category}</p>
          <p>Rating: {movie.rating}</p>
          <iframe
            width="560"
            height="315"
            src={movie.trailer}
            title="Movie Trailer"
            frameBorder="0"
            allowFullScreen
          ></iframe>

          <br />
          <Link to="/seats">
            <Button>Buy Tickets here</Button>
          </Link>
          {hasReviews ? (
            <>
          <h2>Reviews</h2>
          <p>{movie.review1}</p>
          <p>{movie.review2}</p>
          <p>...</p>
          </>
          ) : (
            <p>No reviews yet</p>
          )}
        </div>
      ) : (
        <p>Loading movie details...</p>
      )}
    </div>
  );
};

export default MovieDetails;
