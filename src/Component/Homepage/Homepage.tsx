import React from "react";
import Slider from "../Slider/Slider";
import FoodPage from "../FoodPage/FoodPage";
import FooterCart from "../Footer/Footer";

const HomePage: React.FC = () => {
  return (
    <div className="mt-6">
      <Slider />
      <FoodPage />
      <FooterCart />
    </div>
  );
};

export default HomePage;
