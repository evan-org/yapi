import React from "react";
import styles from "@/app/index.module.scss";
//
import { auth } from "@/app/(auth)/auth";
//
// import Image from "next/image";
// import { useSession, signIn, signOut } from "next-auth/react"
// import {Button} from 'antd'
export default async function Home() {
  const session = await auth()
  return (
    <div className={styles.HomeMain}>
      <div>Access Token: {JSON.stringify(session)}</div>
    </div>
  );
}

