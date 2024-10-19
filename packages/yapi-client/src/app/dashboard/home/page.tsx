'use client'
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import './index.scss'
// import styles from './index.module.scss' //也可以这样导出，可以取出里面的选择器
export default function Home(props: any) {
  console.log(props)
  const router = useRouter()
  console.log(router)
  useEffect(() => {
    console.log(window.location)
  }, [])
  return (
    <div className="pages-home-bkg">
      <div className="text">我是Home首页</div>
    </div>
  )
}
