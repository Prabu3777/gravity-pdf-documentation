import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { Timestamp } from "firebase/firestore";

// 🔹 Define the User state shape
export interface UserState {
  uid: string;
  firstName: string;
  lastName: string;
  email: string; // saved from "username"
  role: "Customer" | "Restaurant Owner" | "Admin" | "";
  mobile: string;
  deliveryFee?: number | null;
  restaurantName?: string | null;
  createdAt?: Date | Timestamp | null;
   premiumStartDate?: Date;
  premiumEndDate?: Date;
}

// 🔹 Initial state
const initialState: UserState = {
  uid: "",
  firstName: "",
  lastName: "",
  email: "",
  role: "",
  mobile: "",
  deliveryFee: null,
  restaurantName: null,
  createdAt: null,
  premiumStartDate:undefined,
  premiumEndDate:undefined
};

// 🔹 Slice
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserState>) => {
      return { ...state, ...action.payload };
    },
    clearUser: () => initialState,
  },
});

// 🔹 Export actions + reducer
export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
