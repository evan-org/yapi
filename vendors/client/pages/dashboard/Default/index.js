import React, { useEffect, useState } from "react";

// material-ui
import { Grid } from "@mui/material";

// ==============================|| DEFAULT DASHBOARD ||============================== //

const Dashboard = () => {
  const [isLoading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <Grid container>
      你好
    </Grid>
  );
};

export default Dashboard;
