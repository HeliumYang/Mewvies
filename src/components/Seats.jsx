import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Seats.css";

function Seats() {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedSeatOptions, setSelectedSeatOptions] = useState([]);

  const handleSeatSelection = (seat) => {
    const updatedSeats = selectedSeats.includes(seat)
      ? selectedSeats.filter((selectedSeat) => selectedSeat !== seat)
      : [...selectedSeats, seat];
    setSelectedSeats(updatedSeats);
    setSelectedSeatOptions([]); // reset 
  };

  const handleOptionChange = (seat, option) => {
    const updatedOptions = [...selectedSeatOptions];
    updatedOptions[seat - 1] = option;
    setSelectedSeatOptions(updatedOptions);
  };

  return (
    <div className="movieDetails">
      <div className="seats">
        <h2>Select seats:</h2>
        <div className="seatRow">
          {selectedSeats.length > 0 && (
            <div className="selectedSeatsInfo">
              <h2>Selected ticket type:</h2>
              <ul className="selectedOptionsRow">
                {selectedSeats.map((seat, index) => (
                  <li key={seat}>
                    Seat {seat}: {selectedSeatOptions[index] || "Select a ticket type"}
                  </li>
                ))}
              </ul>
            </div>
          )}

<div className="seatsRow"> {/* Now using the new 'seatsRow' class */}
            {[1, 2, 3, 4, 5].map((seat) => (
              <div key={seat} className="seatContainer">
                <button
                  onClick={() => handleSeatSelection(seat)}
                  className={selectedSeats.includes(seat) ? "selected" : ""}
                >
                  {seat}
                </button>
                {selectedSeats.includes(seat) && (
                  <select
                    value={selectedSeatOptions[seat - 1] || ""}
                    onChange={(e) => handleOptionChange(seat, e.target.value)}
                  >
                    <option value="">Select a ticket type</option>
                    <option value="adult">Adult</option>
                    <option value="child">Child</option>
                    <option value="senior">Senior</option>
                  </select>
                )}
              </div>
            ))}
          </div>

          <div className="seatsRow"> {/* Another row */}
            {[6, 7, 8, 9, 10].map((seat) => (
              <div key={seat} className="seatContainer">
                <button
                  onClick={() => handleSeatSelection(seat)}
                  className={selectedSeats.includes(seat) ? "selected" : ""}
                >
                  {seat}
                </button>
                {selectedSeats.includes(seat) && (
                  <select
                    value={selectedSeatOptions[seat - 1] || ""}
                    onChange={(e) => handleOptionChange(seat, e.target.value)}
                  >
                    <option value="">Select a ticket type</option>
                    <option value="adult">Adult</option>
                    <option value="child">Child</option>
                    <option value="senior">Senior</option>
                  </select>
                )}
              </div>
            ))}
        </div>  

      <div className="seatsRow"> {/* Another row */}
            {[11, 12, 13, 14, 15].map((seat) => (
              <div key={seat} className="seatContainer">
                <button
                  onClick={() => handleSeatSelection(seat)}
                  className={selectedSeats.includes(seat) ? "selected" : ""}
                >
                  {seat}
                </button>
                {selectedSeats.includes(seat) && (
                  <select
                    value={selectedSeatOptions[seat - 1] || ""}
                    onChange={(e) => handleOptionChange(seat, e.target.value)}
                  >
                    <option value="">Select a ticket type</option>
                    <option value="adult">Adult</option>
                    <option value="child">Child</option>
                    <option value="senior">Senior</option>
                  </select>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>


      {selectedSeats.length > 0 && (
        <div className="options">
          <div className="showtimes">
            <Link to="/seats">
              <button>12:00pm</button>
            </Link>
            <Link to="/seats">
              <button>2:00pm</button>
            </Link>
            <Link to="/seats">
              <button>5:30pm</button>
            </Link>
          </div>
          <Link to="/ordersumm">
            <button className = "checkout-button">Proceed to Checkout</button>
          </Link>
        </div>
      )}
    </div>
  );
}

export default Seats;

   