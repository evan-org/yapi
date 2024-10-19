'use client'
import { useRouter } from "next/navigation"
import { useEffect } from "react"

//这个和其他页面都会传入layout，当其子页面
export default function Pages(props: any) {
	const router = useRouter()

	useEffect(() => {
	}, [])

	return (
		<div>
			我是dashboard页面
		</div>
	)
}