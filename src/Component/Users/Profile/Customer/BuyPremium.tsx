import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { fireDB } from "../../../../firebase.config"; // adjust path
import { toast } from "react-toastify";

interface Plan {
  id: string;
  title: string;
  price: number;
  months: number;
}

const plans: Plan[] = [
  { id: "1", title: "1 Month Plan", price: 99, months: 1 },
  { id: "3", title: "3 Month Plan", price: 200, months: 3 },
  { id: "6", title: "6 Month Plan", price: 379, months: 6 },
  { id: "12", title: "1 Year Plan", price: 500, months: 12 },
];

const BuyPremium: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [userPremium, setUserPremium] = useState<{
    start_date: string;
    end_date: string;
  } | null>(null);

  const auth = getAuth();
  const user = auth.currentUser;

  // Color theme for each card
  const planColors: Record<string, string> = {
    "1": "border-yellow-400 bg-yellow-50 hover:shadow-yellow-200",
    "3": "border-blue-400 bg-blue-50 hover:shadow-blue-200",
    "6": "border-purple-400 bg-purple-50 hover:shadow-purple-200",
    "12": "border-green-400 bg-green-50 hover:shadow-green-200",
  };

  // Fetch user premium info
  useEffect(() => {
    const fetchUser = async () => {
      if (!user) return;
      const ref = doc(fireDB, "users", user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        if (data.premium_start && data.premium_end) {
          setUserPremium({
            start_date: data.premium_start,
            end_date: data.premium_end,
          });
        }
      }
    };
    fetchUser();
  }, [user]);

  // Handle Buy Premium
  const handleBuy = async () => {
    if (!selectedPlan || !user) return;

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + selectedPlan.months);

    try {
      const ref = doc(fireDB, "users", user.uid);
      await updateDoc(ref, {
        premium_start: startDate.toISOString(),
        premium_end: endDate.toISOString(),
      });
      toast.success("Premium purchased successfully!");
      setUserPremium({
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      });
      setSelectedPlan(null);
    } catch (err) {
      toast.error("Failed to update premium plan");
    }
  };

  // Check if user is already premium
  const isPremiumActive =
    userPremium && new Date(userPremium.end_date) > new Date();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">🌟 Buy Premium</h2>

      {isPremiumActive ? (
        <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-6">
          You are already a Premium User until{" "}
          <strong>
            {new Date(userPremium!.end_date).toLocaleDateString("en-IN")}
          </strong>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((plan) => {
              const validTill = new Date();
              validTill.setMonth(validTill.getMonth() + plan.months);

              const isSelected = selectedPlan?.id === plan.id;

              return (
                <div
                  key={plan.id}
                  className={`p-4 border rounded-xl shadow cursor-pointer transition 
                    ${planColors[plan.id]} 
                    ${isSelected ? "ring-2 ring-offset-2 ring-yellow-500" : ""}`}
                  onClick={() => setSelectedPlan(plan)}
                >
                  <h3 className="text-lg font-bold mb-2">{plan.title}</h3>
                  <p className="text-gray-700 font-semibold">₹{plan.price}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Valid Till:{" "}
                    {validTill.toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-6 text-center">
            <button
              disabled={!selectedPlan}
              onClick={handleBuy}
              className={`px-6 py-2 rounded-lg text-white font-semibold ${
                selectedPlan
                  ? "bg-gradient-to-r from-yellow-400 to-yellow-600 hover:opacity-90"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              Buy Premium
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default BuyPremium;
