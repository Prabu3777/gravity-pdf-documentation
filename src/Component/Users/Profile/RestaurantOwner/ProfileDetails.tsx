import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { fireDB } from "../../../../firebase.config";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getAuth, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { toast } from "react-toastify";

type Role = "Customer" | "Restaurant Owner" | "Admin";

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  currentPassword: string; // required
  role: Role;
  mobile: string;
  deliveryFee?: number | null;
  restaurantName?: string | null;
}

const profileSchema: yup.ObjectSchema<UserProfile> = yup.object({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  currentPassword: yup.string().required("Current password is required"),
  role: yup.mixed<Role>().oneOf(["Customer", "Restaurant Owner", "Admin"]).required(),
  mobile: yup.string().matches(/^\d{10}$/, "Must be 10 digits").required(),
  deliveryFee: yup.number().nullable().when("role", {
    is: "Restaurant Owner",
    then: (schema) => schema.typeError("Delivery fee must be a number").min(0, "Must be positive"),
    otherwise: (schema) => schema.notRequired(),
  }),
  restaurantName: yup.string().nullable(),
}).required() as yup.ObjectSchema<UserProfile>;

const ProfileDetails: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<UserProfile | null>(null);
  const authInstance = getAuth();

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<UserProfile>({
    resolver: yupResolver(profileSchema),
    defaultValues: initialData || {},
  });

  const selectedRole = watch("role");

  useEffect(() => {
    const fetchUserData = async () => {
      const user = authInstance.currentUser;
      if (!user) {
        toast.error("You must be logged in");
        setLoading(false);
        return;
      }
      try {
        const docRef = doc(fireDB, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as UserProfile;
          setInitialData({ ...data, currentPassword: "" });
          reset({ ...data, currentPassword: "" });
        } else {
          toast.error("User data not found");
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch user data");
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [authInstance, reset]);

  const onSubmit: SubmitHandler<UserProfile> = async (data) => {
    const user = authInstance.currentUser;
    if (!user) return;

    try {
      // Reauthenticate with current password
      const credential = EmailAuthProvider.credential(user.email!, data.currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update Firestore fields
      const docRef = doc(fireDB, "users", user.uid);
      await updateDoc(docRef, {
        firstName: data.firstName,
        lastName: data.lastName,
        mobile: data.mobile,
        deliveryFee: data.deliveryFee ?? null,
      });

      toast.success("Profile updated successfully!");
      reset({ ...data, currentPassword: "" });
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to update profile: " + err.message);
    }
  };

  if (loading) return <p className="text-center mt-6">Loading...</p>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md space-y-4">
      <h2 className="text-xl font-bold text-center">Profile Details</h2>

      <input {...register("firstName")} placeholder="First Name" className="w-full border p-2 rounded" />
      <p className="text-red-500 text-sm">{errors.firstName?.message}</p>

      <input {...register("lastName")} placeholder="Last Name" className="w-full border p-2 rounded" />
      <p className="text-red-500 text-sm">{errors.lastName?.message}</p>

      <input {...register("email")} placeholder="Email" disabled className="w-full border p-2 rounded bg-gray-100" />
      <p className="text-red-500 text-sm">{errors.email?.message}</p>

      {/* Current password */}
      <input type="password" {...register("currentPassword")} placeholder="Current Password" className="w-full border p-2 rounded" />
      <p className="text-red-500 text-sm">{errors.currentPassword?.message}</p>

      <select {...register("role")} disabled className="w-full border p-2 rounded bg-gray-100">
        <option value="">Select Role</option>
        <option value="Customer">Customer</option>
        <option value="Restaurant Owner">Restaurant Owner</option>
        <option value="Admin">Admin</option>
      </select>

      {selectedRole === "Restaurant Owner" && (
        <>
          <input {...register("restaurantName")} placeholder="Restaurant Name" disabled className="w-full border p-2 rounded bg-gray-100" />
          <input type="number" {...register("deliveryFee")} placeholder="Delivery Fee" className="w-full border p-2 rounded" />
          <p className="text-red-500 text-sm">{errors.deliveryFee?.message}</p>
        </>
      )}

      <input {...register("mobile")} placeholder="Mobile" className="w-full border p-2 rounded" />
      <p className="text-red-500 text-sm">{errors.mobile?.message}</p>

      <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
        Update Profile
      </button>
    </form>
  );
};

export default ProfileDetails;
