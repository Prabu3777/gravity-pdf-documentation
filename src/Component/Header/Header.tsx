import React, { useState } from "react";
import {
  ShoppingCartIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/Food Delivery Logo.jpg";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../Redux/store"; // adjust if needed
import { clearUser } from "../../Redux/UserSlice"; // add clearUser reducer in UserSlice
import { auth } from "../../firebase.config";
import { signOut } from "firebase/auth";
import { toast } from "react-toastify";


const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [userMenuOpen, setUserMenuOpen] = useState<boolean>(false);

  const user = useSelector((state: RootState) => state.user); // ✅ get user from redux
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Logout handler
  const handleLogout = async () => {
    try {
      await signOut(auth);
      dispatch(clearUser()); 
      toast.success("Logout Successful")// clear from redux
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header
      className="w-full px-6 py-3 shadow-md
                 bg-gradient-to-r from-[#f0f4f8] via-[#e2ebf5] to-[#d9e6f2]
                 bg-[length:200%_200%] animate-gradient-x"
    >
      <div className="flex items-center justify-between relative">
        {/* Left - Logo */}
        <div className="flex items-center">
          <img
            src={logo}
            alt="company logo"
            className="w-32 h-12 object-contain"
          />
        </div>

        {/* Center - Search */}
        <div className="flex-1 mx-4">
          <div className="flex items-center w-full border border-gray-300 rounded-lg px-3 py-1">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              className="ml-2 flex-grow outline-none text-sm bg-transparent"
            />
          </div>
        </div>

        {/* Right - Desktop Menu */}
        <nav className="hidden md:flex items-center space-x-6 text-gray-700 font-medium relative">
          <Link to="/" className="hover:text-blue-600">
            Home
          </Link>
          <Link to="/shop" className="hover:text-blue-600">
            Shop
          </Link>
          <Link to="/cart" className="hover:text-blue-600 flex items-center">
            <ShoppingCartIcon className="h-5 w-5 mr-1" /> Cart
          </Link>

          {/* User Dropdown */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen((prev) => !prev)}
              className="focus:outline-none"
            >
              <UserCircleIcon className="h-8 w-8 text-gray-700 cursor-pointer hover:text-blue-600" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-white rounded-lg shadow-lg z-20">
                {user?.uid ? (
                  <>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Signup
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </nav>

        {/* Mobile toggle */}
        <div className="md:hidden flex items-center">
          <button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? (
              <XMarkIcon className="h-6 w-6 text-gray-700" />
            ) : (
              <Bars3Icon className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden mt-3 space-y-1 text-gray-700 font-medium">
          <Link to="/" className="block px-2 py-2 hover:text-blue-600">
            Home
          </Link>
          <Link to="/shop" className="block px-2 py-2 hover:text-blue-600">
            Shop
          </Link>
          <Link
            to="/cart"
            className="px-2 py-2 hover:text-blue-600 flex items-center"
          >
            <ShoppingCartIcon className="h-5 w-5 mr-1" /> Cart
          </Link>

          {user?.uid ? (
            <>
              <Link
                to="/profile"
                className="px-2 py-2 hover:text-blue-600 flex items-center"
              >
                <UserCircleIcon className="h-6 w-6 mr-1 text-gray-700" /> Profile
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-2 py-2 hover:text-blue-600 flex items-center"
              >
                <UserCircleIcon className="h-6 w-6 mr-1 text-gray-700" /> Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-2 py-2 hover:text-blue-600 flex items-center"
              >
                <UserCircleIcon className="h-6 w-6 mr-1 text-gray-700" /> Login
              </Link>
              <Link
                to="/signup"
                className="px-2 py-2 hover:text-blue-600 flex items-center"
              >
                <UserCircleIcon className="h-6 w-6 mr-1 text-gray-700" /> Signup
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
