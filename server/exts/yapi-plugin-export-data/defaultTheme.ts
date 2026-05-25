// @ts-nocheck
import { dirnameFromMeta } from '../../utils/esm-path.js';
const __dirname = dirnameFromMeta(import.meta);
import fs from 'fs';

import sysPath from 'path';

const css = fs.readFileSync(sysPath.join(__dirname, "./defaultTheme.css"));
export default "<style>" + css + "</style>";
