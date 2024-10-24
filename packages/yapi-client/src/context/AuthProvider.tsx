"use client"
import React, { useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import { useAppSelector, useAppDispatch } from "@/store/hooks.ts";
import { getToken, getUserInfo, setToken, setUserInfo } from "@/shared/auth";
import { userInfoActions } from "@/store/slices/user.ts";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const userState = useAppSelector((state: any) => state.user);
  console.log("AuthProvider", userState);
  console.log("localstorage", getToken(), getUserInfo());
  const dispatch = useAppDispatch();
  //
  useEffect(() => {
    (async() => {
      const token = getToken();
      console.log("token", token);
      if (token) {
        const userInfo = await dispatch(userInfoActions());
        if (token && userInfo) {
          setToken(token);
          setUserInfo(userInfo);
        }
      } else {
        console.log("token exist");
      }
    })();
  }, []);
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  )
}
