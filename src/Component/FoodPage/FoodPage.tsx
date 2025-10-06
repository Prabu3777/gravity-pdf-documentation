import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { fireDB } from "../../firebase.config";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom"; // ✅ Import for navigation

interface FoodItem {
  id: string;
  foodName: string;
  foodHotel: string;
  foodPrice: number;
  foodImage: string;
  deliveryTime: number;
  discountPercentage?: number | null;
}

const FoodPage: React.FC = () => {
  const [items, setItems] = useState<FoodItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [userId, setUserId] = useState<string | null>(null);

  const auth = getAuth();
  const navigate = useNavigate(); // ✅ Initialize navigate

  // ✅ Watch login/logout
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        await fetchCart(user.uid);
      } else {
        setUserId(null);
        setCart({});
      }
    });
    return () => unsubscribe();
  }, []);

  // ✅ Fetch cart for user
  const fetchCart = async (uid: string) => {
    try {
      const q = query(collection(fireDB, "cart"), where("userId", "==", uid));
      const snapshot = await getDocs(q);

      const cartData: Record<string, number> = {};
      snapshot.forEach((doc) => {
        const data = doc.data();
        cartData[data.itemId] = data.quantity;
      });

      setCart(cartData);
    } catch (err) {
      console.error("Error fetching cart:", err);
    }
  };

  // ✅ Fetch food items
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const snapshot = await getDocs(collection(fireDB, "foodItems"));
        const list: FoodItem[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as FoodItem[];
        setItems(list);
      } catch (error) {
        console.error("Error fetching items:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  // ✅ Handle Add to Cart
  const handleAdd = async (item: FoodItem) => {
    if (!userId) {
      toast.error("Please login to add items to cart");
      navigate("/login"); // ✅ Redirect to login
      return;
    }

    const newQty = (cart[item.id] || 0) + 1;
    setCart({ ...cart, [item.id]: newQty });

    try {
      await setDoc(doc(fireDB, "cart", `${userId}_${item.id}`), {
        userId,
        itemId: item.id,
        quantity: newQty,
        foodName: item.foodName,
        foodHotel: item.foodHotel,
        foodImage: item.foodImage,
        foodPrice: item.foodPrice,
        discountPercentage: item.discountPercentage || 0,
        deliveryTime: item.deliveryTime,
      });
    } catch (err) {
      console.error("Error updating cart:", err);
    }
  };

  // ✅ Handle Remove from Cart
  const handleRemove = async (item: FoodItem) => {
    if (!userId) {
      toast.error("Please login to manage cart");
      navigate("/login"); // ✅ Redirect to login
      return;
    }

    const currentQty = cart[item.id] || 0;
    if (currentQty <= 0) return;

    const newQty = currentQty - 1;
    setCart({ ...cart, [item.id]: newQty });

    try {
      if (newQty > 0) {
        await setDoc(doc(fireDB, "cart", `${userId}_${item.id}`), {
          userId,
          itemId: item.id,
          quantity: newQty,
          foodName: item.foodName,
          foodHotel: item.foodHotel,
          foodImage: item.foodImage,
          foodPrice: item.foodPrice,
          discountPercentage: item.discountPercentage || 0,
          deliveryTime: item.deliveryTime,
        });
      } else {
        await deleteDoc(doc(fireDB, "cart", `${userId}_${item.id}`));
      }
    } catch (err) {
      console.error("Error updating cart:", err);
    }
  };

  // ✅ Filter by search
  const filteredItems = items.filter((item) =>
    [item.foodName, item.foodHotel]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 w-full">
      <h2 className="text-2xl font-bold mb-4 text-center md:text-left">
        Food Items
      </h2>

      {/* Search Input */}
      <div className="mb-6 flex justify-center md:justify-start">
        <input
          type="text"
          placeholder="🔍 Search by food name or restaurant..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/2 p-3 border-2 border-purple-500 rounded-lg 
                     focus:outline-none focus:ring-2 focus:ring-purple-400 
                     bg-gray-50 text-black placeholder-gray-500 shadow-sm"
        />
      </div>

      {loading ? (
        <p className="text-center">Loading items...</p>
      ) : filteredItems.length === 0 ? (
        <p className="text-center text-gray-500">No items found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => {
            const hasDiscount =
              item.discountPercentage && item.discountPercentage > 0;
            const discountedPrice = hasDiscount
              ? item.foodPrice -
                (item.foodPrice * (item.discountPercentage || 0)) / 100
              : item.foodPrice;

            return (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition flex flex-col"
              >
                {/* Image */}
                <img
                  src={item.foodImage}
                  alt={item.foodName}
                  className="w-full h-40 object-cover"
                />

                {/* Details */}
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="font-bold text-lg">{item.foodName}</h3>
                  <p className="text-gray-600 text-sm">{item.foodHotel}</p>
                  <p className="text-gray-500 text-sm">
                    Delivery: {item.deliveryTime} mins
                  </p>

                  {/* Price */}
                  <div className="mt-2">
                    {hasDiscount ? (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 line-through">
                          ₹{item.foodPrice.toFixed(2)}
                        </span>
                        <span className="text-green-600 font-bold">
                          ₹{discountedPrice.toFixed(2)}
                        </span>
                        <span className="text-sm text-red-500">
                          ({item.discountPercentage}% OFF)
                        </span>
                      </div>
                    ) : (
                      <span className="text-black font-semibold">
                        ₹{item.foodPrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Cart Controls */}
                  <div className="mt-4 flex items-center gap-3">
                    <button
                      onClick={() => handleRemove(item)}
                      className="px-3 py-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      -
                    </button>
                    <span className="font-bold text-lg">
                      {cart[item.id] || 0}
                    </span>
                    <button
                      onClick={() => handleAdd(item)}
                      className="px-3 py-1 bg-green-500 text-white rounded-full hover:bg-green-600"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FoodPage;
