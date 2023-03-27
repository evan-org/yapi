import React from 'react';
import { useNavigate } from 'react-router-dom';
import Err404Module from './Err404.module.scss'
//
import { Button } from '@mui/material';
function Main() {
  const navigate = useNavigate();
  return (
    <div className={Err404Module.Err404}>
      <div className={'title'}>404</div>
      <Button type="primary" size="small" onClick={() => navigate('/home')}>点击回到首页</Button>
    </div>
  )
}
export default Main
