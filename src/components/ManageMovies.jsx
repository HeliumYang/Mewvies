import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Header.css";
import "./Button.css";
import "./Movie.css";
import Movie from "./Movie";
import Button from "./Button";
import Search from "./Search";
import { getCurrentMovies, getUpcomingMovies, removeMovie, getMovie } from "../functionality/movie";

function ManageMovies() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentIndex2, setCurrentIndex2] = useState(0);
    const [upcomingMovies, setUpcomingMovies] = useState([]);
    const [currentlyRunningShows, setCurrentlyRunningShows] = useState([]);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % currentlyRunningShows.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + currentlyRunningShows.length) % currentlyRunningShows.length);
  };


  const handleNext2 = () => {
    setCurrentIndex2((prevIndex2) => (prevIndex2 + 1) % upcomingMovies.length);
  };

  const handlePrev2 = () => {
    setCurrentIndex2((prevIndex2) => (prevIndex2 - 1 + upcomingMovies.length) % currentlyRunningShows.length);
  };

  useEffect(() => {
    getUpcomingMovies().then((data) => {
        setUpcomingMovies(data);
    })
    getCurrentMovies().then((data) => {
      setCurrentlyRunningShows(data);
    })
  }, []);

  const fetchMovie = async() => {
    const currentMovies = await getCurrentMovies();
    const upcoming = await getUpcomingMovies();
    setCurrentlyRunningShows(currentMovies);
    setUpcomingMovies(upcoming);
  }

  const handleDeleteMovie = async (movie_id) => {
  await removeMovie(movie_id);
  fetchMovie();
  }
  return (
    <div className="Movie">
     <div>
            <Link to ="/manageusers">
             <Button className="manage">Manage Users</Button> 
            </Link>
            <Link to ="/managepromotions">
             <Button className="manage">Manage Promos</Button> 
            </Link>
      </div>
      <h1>Manage Movies</h1>
      <Link to ="/addmovie">
             <button className="btn">Add Movie</button> 
      </Link>
      <h1>Currently Running</h1>
      <div className="Currently-Running">
        {currentlyRunningShows.map((show, index) => (
          <div className="MovieCard" key={index} >
            <h3>{show.movie_title}</h3>
              <img
                src={show.picture}
                alt={show.movie_title}
                width="300"
              />
            <Button>Change Theater</Button>
            <Link to ={`/editmovie/${show.movie_id}`}>
            <Button>Update Details</Button>
            </Link>
            <Button onClick={() => handleDeleteMovie(show.movie_id)}>Delete Movie</Button>
          </div>
        ))}
      </div>
    
      <h1>Coming Soon</h1>
      <div className="Coming-Soon">
        {upcomingMovies.map((show, index) => (
          <div className="MovieCard" key={index}>
            <h3>{show.movie_title}</h3>
            <Link to="/coming-soon">
              <img
                src={show.picture}
                alt={show.movie_title}
                width="300"
              />
            </Link>
            <Button>Change Theater</Button>
            <Button>Update Details</Button>
            <Button onClick={() => handleDeleteMovie(show.movie_id)}>Delete Movie</Button>
          </div>
        ))}
      </div>
       </div>

    
  );
}

export default ManageMovies;
