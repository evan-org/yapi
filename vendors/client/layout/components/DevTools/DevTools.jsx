import React from "react";
import { createDevTools } from "redux-devtools";
import LogMonitor from "redux-devtools-log-monitor";
import SliderMonitor from "redux-slider-monitor";
import DockMonitor from "redux-devtools-dock-monitor";

module.exports = createDevTools(
  <DockMonitor toggleVisibilityKey="ctrl-h" changePositionKey="ctrl-q" defaultIsVisible={false}>
    <LogMonitor/>
    <SliderMonitor />
  </DockMonitor>
);
