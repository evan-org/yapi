'use client'

import {useAppDispatch, useAppSelector} from "@/lib/hooks";
import {useEffect} from "react";
import {increment} from "@/lib/slices/homeSlice";

export default function UserDetail() {
    const dispatch = useAppDispatch()
    const {value} = useAppSelector(state => state.home)

    useEffect(() => {
        console.log('useeffect value is = ', value)
        dispatch(increment())
    }, []);

    return (
        <div>
            user detail components
        </div>
    );
}
