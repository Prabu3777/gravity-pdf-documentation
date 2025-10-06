import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { fireDB } from "../../firebase.config";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Link } from "react-router-dom";

const FooterCart: React.FC = () => {
  const [cartCount, setCartCount] = useState(0);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const auth = getAuth();

  useEffect(() => {
    let unsubscribeCart: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user && user.uid) {
        setUserLoggedIn(true);
        // Listen to cart changes in realtime
        const q = query(collection(fireDB, "cart"), where("userId", "==", user.uid));
        unsubscribeCart = onSnapshot(q, (snapshot) => {
          let total = 0;
          snapshot.forEach((doc) => {
            const data = doc.data();
            total += data.quantity || 0;
          });
          setCartCount(total);
        });
      } else {
        setUserLoggedIn(false);
        setCartCount(0);
        if (unsubscribeCart) {
          unsubscribeCart();
          unsubscribeCart = null;
        }
      }
      setAuthChecked(true);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeCart) unsubscribeCart();
    };
  }, [auth]);

  // Show nothing until we know auth status
  if (!authChecked) return null;

  // Hide footer if user not logged in or cart empty
  if (!userLoggedIn || cartCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-purple-600/80 backdrop-blur-sm shadow-lg p-4 flex justify-between items-center z-50">
      <div className="text-white font-bold">
        {cartCount} item{cartCount > 1 ? "s" : ""} in Cart
      </div>
      <Link
        to="/cart"
        className="bg-white/90 text-purple-700 font-bold px-4 py-2 rounded-lg hover:bg-white"
      >
        Go to Cart
      </Link>
    </div>
  );
};

export default FooterCart;
