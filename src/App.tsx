import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Header from "./Component/Header/Header";
import HomePage from "./Component/Homepage/Homepage";
import LoginForm from "./Component/Users/LoginForm";
import SignupForm from "./Component/Users/SignUpForm";
import ProfileLayout from "./Component/Users/Profile/Profile";
import CartItems from "./Component/CartItems/CartItems";
import Shop from "./Component/ShopComponent/ShopComponent";
import ItemWithRating from "./Component/ShopComponent/ItemWithRating";
import ProtectedRoute from "./Component/CartItems/ProtectedRoute"; // ✅

const App: React.FC = () => {
  return (
    <Router>
      <Header />
      <main className="p-4">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/signup" element={<SignupForm />} />
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <CartItems />
              </ProtectedRoute>
            }
          />
          <Route path="/shop" element={<Shop />} />
          <Route path="/item/:id" element={<ItemWithRating />} />

          <Route
            path="/profile/*"
            element={
              <ProtectedRoute>
                <ProfileLayout />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </Router>
  );
};

export default App;
