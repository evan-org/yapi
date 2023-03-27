import React  from 'react';
import styles from './Abnormal.module.less';
import nullPng from '@/assets/images/null.png';
function Main() {
  return (
    <div className={styles.Abnormal}>
      <div className={styles.content}>
        <div className={styles.imgBox}>
          <img src={nullPng} className={styles.img} alt=""/>
        </div>
        <div className={styles.txt}>哇哦~出错了！</div>
      </div>
    </div>
  );
}
//
export default Main
