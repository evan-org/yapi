"use client"
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks.ts";
// import { increment } from "@/store/slices/homeSlice";

export default function UserDetail() {
  // const dispatch = useAppDispatch()
  const { value } = useAppSelector((state) => state.app)
  useEffect(() => {
    console.log("useeffect value is = ", value)
    // dispatch(increment())
  }, []);
  return (
    <div>
      user detail components
    </div>
  );
}
