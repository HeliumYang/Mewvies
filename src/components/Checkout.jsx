import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { collection, getDocs, query, where, addDoc } from "firebase/firestore";
import { db } from "../config/firestore";
import Button from "./Button";
import "./Checkout.css";
import { decryptData } from "../services/crypto";
import {
  getAuth,
} from "firebase/auth";
import { addMultiplePayments, getPaymentCards, passphrase } from "../functionality/User";

function Checkout() {


  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const { state } = useLocation();
  const { selectedSeats, seatTypes, showingTime, showingId, movieTitle, movieId } =
    state || {}; // location.state;
    console.log("movieId: ", movieId);
    //console.log("showingId: ", showingId);

  const bookingId = location.state?.bookingId;
  const initialSeatTypes = seatTypes || {};
  const [editableSeatTypes, setEditableSeatTypes] = useState(initialSeatTypes);
  const [editingSeat, setEditingSeat] = useState(null);
  const [total, setTotal] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [fees, setFees] = useState({});  
  const [cards, setCards] = useState([]); 
  const [selectedCard, setSelectedCard] = useState(null);
  const [ticketPrices, setTicketPrices] = useState({});

  const [hasCard, setHasCard] = useState(false);
  const [has3Cards, setHas3Cards] = useState(false);
  const [cardIndex, setCardIndex] = useState("");

 /**CARD */
 const [cardNumber, setCardNumber] = useState("");
 const [cardName, setCardName] = useState("");
 const [cardType, setCardType] = useState("");
 const [cvv, setCvv] = useState("");
 const [expiration, setExpiration] = useState("");

 const [billingAddressOne, setBillingAddressOne] = useState("");
 const [billingAddressTwo, setBillingAddressTwo] = useState("");
 const [billingCity, setBillingCity] = useState("");
 const [billingState, setBillingState] = useState("");
 const [billingZip, setBillingZip] = useState("");


  const auth = getAuth();
  const currentUser = auth.currentUser; // Get the current user

  if (!currentUser) {
    console.log("No user logged in");
    navigate('/login'); // Redirect to login if no user
    return;
  }

  /* ticket prices */
  useEffect(() => {
    const fetchTicketPrices = async () => {
      const pricesSnapshot = await getDocs(collection(db, "ticket"));
      const pricesData = {};
      pricesSnapshot.forEach(doc => {
        pricesData[doc.id] = doc.data().price;
      });
      setTicketPrices(pricesData);
    };
  
    fetchTicketPrices();
  }, []);

  /* online fees */
  useEffect(() => {
    const fetchFees = async () => {
      const feesSnapshot = await getDocs(collection(db, "fees"));
      const feesData = {};
      feesSnapshot.forEach(doc => {
        feesData[doc.id] = doc.data().price; // assuming rates and fees could be structured differently
      });
      setFees(feesData);
    };
  
    fetchFees();
  }, []);



  const renderTicketTypeDropdown = (seat) => {

    const currentValue = editableSeatTypes[seat] || '';
  
    return (
      <select
        value={currentValue}
        onChange={(e) => handleTicketTypeChange(seat, e.target.value)}
        onBlur={() => setEditingSeat(null)}
      >
        <option value="" disabled>{'Select a Ticket Type'}</option>
        {Object.entries(ticketPrices).map(([type, price]) => (
          <option key={type} value={`${type}: ${price}`}>
            {`${type.charAt(0).toUpperCase() + type.slice(1)}: $${price}`}
          </option>
        ))}
      </select>
    );
  };
  
  useEffect(() => {
    const fetchCards = async () => {
      try {
        const cardData = await getPaymentCards(currentUser.uid);
        if (cardData === null || cardData.length === 0) { 
          setCards([]); 
          setCardIndex(0);
          setHasCard(false);
          setHas3Cards(false); 
        } else {
          const onlyCardData = cardData.map((card) => card.encrypted_card_data);
          setCards(onlyCardData);
          setHasCard(true);
          setCardIndex(cardData.length);
  
          if (cardData.length === 3) { 
            setHas3Cards(true);
            setCardIndex(3);
          } else {
            setHas3Cards(false);
          }
        }
      } catch (error) {
        console.error("Failed to fetch or decrypt card data:", error);
      }
    };
  
    fetchCards();
  }, []); 
  


  const handleSubmit = async (e) => {
    e.preventDefault();
    const auth = getAuth();
    const user = auth.currentUser;

    if (!has3Cards) {
      const uid = user.uid;
      addMultiplePayments(cardName, cardNumber, cardType, expiration, billingAddressOne, billingAddressTwo, billingCity, billingState, billingZip, uid, cardIndex);
    }

    //WAIT BEFORE RELOAD
    setTimeout(() => {
      window.location.reload();
  }, 5000);

    };  
  
    const handleCheckout = async (e) => {
      e.preventDefault();
      const auth = getAuth();
      const user = auth.currentUser;
  
      if (!selectedCard) {
        alert('Please select a payment method');
        return;
      }
//      console.log("User UID: ", user.uid);
      const orderData = {
        customer_id: user.uid,
        movie_id: movieId,
        order_id: "GenerateOrFetchThisID",
        payment_id: "GenerateOrFetchPaymentID", 
        promo_id: "YourPromoID", // idk how to do this 
        purchase_time: new Date().toISOString(), 
        seat_number: selectedSeats.join(", "), 
        showing_id: showingId, 
        ticket_price: total.toString(), 
        ticket_type: JSON.stringify(editableSeatTypes), 
        payment_details: {
          cardNumber: selectedCard.card_number,
          cardName: selectedCard.card_name,
          cardType: selectedCard.card_type,
          expiration: selectedCard.expiration,
          billingAddressOne: selectedCard.billing_address_one,
          billingAddressTwo: selectedCard.billing_address_two,
          billingCity: selectedCard.billing_city,
          billingState: selectedCard.billing_state,
          billingZip: selectedCard.billing_zip
        }
      };  

    try {
      const docRef = await addDoc(collection(db, "order"), orderData);
      console.log("Document written with ID: ", docRef.id);
  
      navigate("/movie-details/ordersumm", {
        state: {
          movieTitle: movieTitle,
          showingTime: showingTime,
          selectedSeats: selectedSeats,
          seatTypes: editableSeatTypes,
          total: total,
        },
        replace: true,
      });
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      if (bookingId) {
        const q = query(
          collection(db, "order"),
          where("bookingId", "==", bookingId)
        );
        const querySnapshot = await getDocs(q);
        const fetchedOrders = [];
        querySnapshot.forEach((doc) => {
          fetchedOrders.push(doc.data());
        });
        setOrders(fetchedOrders);
      }
    };

    fetchOrders();
  }, [bookingId]);

  if (!selectedSeats || !seatTypes) {
    return <p>No data available</p>; // or handle redirection
  }

//  console.log("Received Showing Time:", showingTime);

const handleTicketTypeChange = (seat, value) => {
//  const newType = `${Object.keys(ticketPrices).find(key => ticketPrices[key] === parseFloat(value))}: ${value}`;
setEditableSeatTypes(prev => ({ ...prev, [seat]: value }));
};



  useEffect(() => {
    const newTotal = selectedSeats.reduce((total, seat) => {
      const price = editableSeatTypes[seat]; 
    return total + price;
    }, 0);
    setTotal(newTotal);
  }, [editableSeatTypes, selectedSeats]); // Listen to changes in editableSeatTypes

  useEffect(() => {
    setEditableSeatTypes(seatTypes);
  }, [seatTypes]);

  /* calculating price */
  useEffect(() => {
    const newSubtotal = selectedSeats.reduce((acc, seat) => {
      const price = editableSeatTypes[seat] && typeof editableSeatTypes[seat] === 'string'
        ? parseFloat(editableSeatTypes[seat].split(':')[1])
        : 0;
      return acc + price;
    }, 0);
    setSubtotal(newSubtotal);

    const tax = newSubtotal * (fees.salesTax || 0);
    const onlineFees = selectedSeats.length * (fees.onlineFees || 0);
    const totalWithTaxAndFees = newSubtotal + tax + onlineFees;
    setTotal(totalWithTaxAndFees);
}, [selectedSeats, editableSeatTypes, fees]);

  return (
    <div className="Summary">
      <h1>Checkout</h1>
      <h2>Order Summary View:</h2>

      <h3> Movie: {movieTitle} </h3>
      <h3>Showtime: {new Date(showingTime).toLocaleString()}</h3>
      <h3>Ticket Type and Prices:</h3>
      <ul>
  {selectedSeats.map((seat, index) => (
    <li key={index}>
      Seat {seat}- 
      {editingSeat === seat ? (
        renderTicketTypeDropdown(seat)
      ) : (
        <span>
          {editableSeatTypes[seat].split(':')[0]}: ${parseFloat(editableSeatTypes[seat].split(':')[1]).toFixed(2)}
          <button
            className="edit-button"
            onClick={() => setEditingSeat(seat)}
          >
            Edit Ticket
          </button>
        </span>
      )}
    </li>
  ))}
</ul>


      <h3>Total: </h3>
      <h4>Ticket prices: ${subtotal.toFixed(2)}</h4>
      <h4>Sales Tax: ({(fees.salesTax * 100).toFixed(0)}%): ${(subtotal * fees.salesTax).toFixed(2)}</h4>
      <h4>Online Fees: ${(selectedSeats.length * fees.onlineFees).toFixed(2)}</h4>

      <h3>
        Total amount: $
        {(
          subtotal +
          subtotal * fees.salesTax +
          selectedSeats.length * fees.onlineFees
        ).toFixed(2)}
      </h3>

      <h2>Checkout</h2>

      {!has3Cards && (
             <>
              <div className="card-details">
              <h3>New Card</h3>
              <form onSubmit={handleSubmit}>
                <label>
                  Name on Card:{" "}
                  <input
                    type="text"
                    name="cardName"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="input-field"
                  />
                </label>
                <br />
                <label>
                  Card Number:{" "}
                  <input
                    type="text"
                    name="cardNumber"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="input-field"
                  />
                </label>
                <br />
                <label>
                  Card Type: {" "}
                  <input
                    type="text"
                    name="cardType"
                    value={cardType}
                    onChange={(e) => setCardType(e.target.value)}
                    className="input-field"
                  />
                </label>
                <br />
                <label>
                  CVV:{" "}
                  <input
                    type="text"
                    name="cvv"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    className="input-field"
                  />
                </label>
                <br />
                <label>
                  Expiration Date:{" "}
                  <input
                    type="text"
                    name="expirationDate"
                    value={expiration}
                    onChange={(e) => setExpiration(e.target.value)}
                    className="input-field"
                  />
                </label>
                <br />
                <br />
                <label>
                  Billing Address:{" "}
                  <input
                    type="text"
                    name="billingAddressOne"
                    value={billingAddressOne}
                    onChange={(e) => setBillingAddressOne(e.target.value)}
                    className="input-field"
                  />
                </label>
                <br />
                <label>
                  Address Line 2: {" "}
                  <input
                    type="text"
                    name="billingAddressTwo"
                    value={billingAddressTwo}
                    onChange={(e) => setBillingAddressTwo(e.target.value)}
                    className="input-field"
                  />
                </label>
                <br />
                <label>
                  City: {" "}
                  <input
                    type="text"
                    name="city"
                    value={billingCity}
                    onChange={(e) => setBillingCity(e.target.value)}
                    className="input-field"
                  />
                </label>
                <br />
                <label>
                  State: {" "}
                  <input
                    type="text"
                    name="state"
                    value={billingState}
                    onChange={(e) => setBillingState(e.target.value)}
                    className="input-field"
                  />
                </label>
                <br />
                <label>
                  Zip Code: {" "}
                  <input
                    type="text"
                    name="zipCode"
                    value={billingZip}
                    onChange={(e) => setBillingZip(e.target.value)}
                    className="input-field"
                  />
                  <br />
                </label>
                <button type="submit" className="submit-button">
              Submit Card Info
            </button>
        </form>
                </div>
              </>
            )}

      <div className = "cards">
      <div className = "buttons">
        {cards.map((card, index) => (
           <div key={index} onClick={() => setSelectedCard(card)} className="card-option">
           <button className="card-button">
            <p>Card Ending in {card.card_number.slice(-4)}</p>
            <p>Type: {card.card_type}</p>
            <p>Expires: {card.expiration}</p>
            </button>
          </div> 
        ))}
        </div>

        {hasCard ? (
        <Button onClick={handleCheckout}>
          Confirm Payment Order
        </Button>
        ): null}
        
      </div>
    </div>
  );
}

export default Checkout;
