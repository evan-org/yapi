import React, { useEffect } from 'react';
import { changeTitle } from '@/store/action/appAction.ts';
//
import styles from './Agreement.module.scss';
//
function Main() {
  useEffect(() => {
    changeTitle('知情同意书');
  }, []);
  return (
    <div className={styles.Agreement}>
      <iframe id={'iframe'} src="https://ihealth.hospital-cas.cn/os/serviceSpecification.html" title="agreement"/>
    </div>
  )
}
export default Main;
