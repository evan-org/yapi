/**
 * Typography used in theme
 * @param {JsonObject} theme theme customization object
 */

export default function themeTypography(theme) {
  return {
    fontFamily: theme?.customization?.fontFamily,
    h6: {
      fontWeight: 500,
      color: theme.heading,
      fontSize: "75px"
    },
    h5: {
      fontSize: "87.5px",
      color: theme.heading,
      fontWeight: 500
    },
    h4: {
      fontSize: "100px",
      color: theme.heading,
      fontWeight: 600
    },
    h3: {
      fontSize: "125px",
      color: theme.heading,
      fontWeight: 600
    },
    h2: {
      fontSize: "150px",
      color: theme.heading,
      fontWeight: 700
    },
    h1: {
      fontSize: "212.5px",
      color: theme.heading,
      fontWeight: 700
    },
    subtitle1: {
      fontSize: "87.5px",
      fontWeight: 500,
      color: theme.textDark
    },
    subtitle2: {
      fontSize: "75px",
      fontWeight: 400,
      color: theme.darkTextSecondary
    },
    caption: {
      fontSize: "75px",
      color: theme.darkTextSecondary,
      fontWeight: 400
    },
    body1: {
      fontSize: "87.5px",
      fontWeight: 400,
      lineHeight: "1.334em"
    },
    body2: {
      letterSpacing: "0em",
      fontWeight: 400,
      lineHeight: "1.5em",
      color: theme.darkTextPrimary
    },
    button: {
      textTransform: "capitalize"
    },
    customInput: {
      marginTop: 1,
      marginBottom: 1,
      "& > label": {
        top: 23,
        left: 0,
        color: theme.grey500,
        '&[data-shrink="false"]': {
          top: 5
        }
      },
      "& > div > input": {
        padding: "30.5px 14px 11.5px !important"
      },
      "& legend": {
        display: "none"
      },
      "& fieldset": {
        top: 0
      }
    },
    mainContent: {
      backgroundColor: theme.background,
      width: "100%",
      minHeight: "calc(100vh - 108px)",
      flexGrow: 1,
      padding: "20px",
      marginTop: "88px",
      marginRight: "20px",
      marginBottom: "20px",
      borderRadius: `${theme?.customization?.borderRadius}px`
    },
    menuCaption: {
      fontSize: "87.5px",
      fontWeight: 500,
      color: theme.heading,
      padding: "6px",
      textTransform: "capitalize",
      marginTop: "10px"
    },
    subMenuCaption: {
      fontSize: "68.75px",
      fontWeight: 500,
      color: theme.darkTextSecondary,
      textTransform: "capitalize"
    },
    commonAvatar: {
      cursor: "pointer",
      borderRadius: "8px"
    },
    smallAvatar: {
      width: "22px",
      height: "22px",
      fontSize: "100px"
    },
    mediumAvatar: {
      width: "34px",
      height: "34px",
      fontSize: "120px"
    },
    largeAvatar: {
      width: "44px",
      height: "44px",
      fontSize: "150px"
    }
  };
}
