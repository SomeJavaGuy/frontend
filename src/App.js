import { useState, useEffect } from "react";
import {
  Tabs,
  Tab,
  Grid,
  LinearProgress,
  Paper,
  Box,
  TextField,
  Button,
  Link,
  Typography,
} from "@material-ui/core";
import { Twitter, GitHub, LinkedIn, Language } from "@material-ui/icons";
// Components
import ConnectWallet from "./components/ConnectWallet";
// ABIs
const stableABI = require("./abis/ERC20.json");
const nftABI = require("./abis/ERC1155.json");
const ExchangeABI = require("./abis/Exchange.json");
// BN
const { BN, toWei } = require("web3-utils");

const truncateWithDots = (
  str,
  firstCharCount = 6,
  endCharCount = 4,
  dotCount = 4
) => {
  var convertedStr = "";
  convertedStr += str.substring(0, firstCharCount);
  convertedStr += ".".repeat(dotCount);
  convertedStr += str.substring(str.length - endCharCount, str.length);
  return convertedStr;
};

function App() {
  const [web3, setWeb3] = useState();
  const [account, setAccount] = useState("");
  const [inputDisabled, setInputDisabled] = useState(true);
  const [loading, setLoading] = useState(false);

  const toDecimal = async (tokenInstance, amount, isETH) => {
    var decimals = isETH
      ? 18
      : parseInt(await tokenInstance.methods.decimals().call());
    const divisor = new BN("10").pow(new BN(decimals));
    const beforeDec = new BN(amount).div(divisor).toString();
    var afterDec = new BN(amount).mod(divisor).toString();

    if (afterDec.length < decimals && afterDec !== "0") {
      // pad with extra zeroes
      const pad = Array(decimals + 1).join("0");
      afterDec = (pad + afterDec).slice(-decimals);
    }

    // remove insignificant trailing zeros
    return ((beforeDec + "." + afterDec) * 1).toString();
  };

  const numberWithCommas = (x) => {
    return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
  };

  useEffect(() => {
    if (web3) {
      setInputDisabled(false);
    }
  }, [web3]);

  return (
    <Grid container direction="column">
      <Grid
        container
        style={{
          marginBottom: "40px",
          marginTop: "40px",
          paddingBottom: "30px",
          borderBottom: "2px solid black",
        }}
      >
        <Grid item xs={3} />
        <Grid
          item
          xs={6}
          container
          justify="center"
          style={{
            paddingRight: "2rem",
          }}
        >
          <Box
            fontWeight="fontWeightBold"
            fontSize="2.5rem"
            fontFamily="fontFamily"
            fontStyle=""
            color="#673ab7"
          >
            🖼️ NFTP🕶L.Exchange🔁
          </Box>
        </Grid>
        <Grid
          item
          xs={3}
          container
          justify="flex-end"
          style={{
            paddingRight: "2rem",
          }}
        >
          {!web3 ? (
            <ConnectWallet setWeb3={setWeb3} setAccount={setAccount} />
          ) : (
            <Grid container direction="column" alignItems="flex-end">
              <Grid item>
                <Box
                  fontWeight="fontWeightBold"
                  fontSize="1.2rem"
                  fontFamily="fontFamily"
                  fontStyle=""
                  style={{
                    color: "green",
                    marginRight: "0.5rem",
                  }}
                >
                  • Connected
                </Box>
              </Grid>
              <Grid item>
                <Box
                  fontWeight="fontWeightBold"
                  fontFamily="fontFamily"
                  style={{
                    color: "#04ad04",
                  }}
                >
                  {`(${truncateWithDots(account)})`}
                </Box>
              </Grid>
            </Grid>
          )}
        </Grid>
      </Grid>
      <LinearProgress
        style={{
          marginLeft: "9.5%",
          maxWidth: "81%",
          ...(loading ? { display: "block" } : { display: "none" }),
        }}
      />
      <Paper
        elevation={2}
        style={{
          margin: "auto",
          padding: "2rem 10rem",
          minWidth: "60%",
        }}
      ></Paper>
      <Grid
        container
        style={{
          marginTop: "30px",
          paddingBottom: "40px",
          paddingTop: "30px",
          borderTop: "2px solid black",
          backgroundColor: "black",
        }}
      >
        <Grid item xs={3} />
        <Grid
          item
          xs={6}
          container
          justify="center"
          style={{
            paddingRight: "2rem",
          }}
        >
          <Grid container direction="column">
            <Box
              fontWeight="fontWeightBold"
              fontSize="1.75rem"
              fontFamily="fontFamily"
              fontStyle=""
              color="white"
            >
              Developed by:{" "}
              <Link
                href="https://apoorvlathey.com/"
                target="_blank"
                rel="noopener"
                style={{
                  color: "white",
                  textDecoration: "underline",
                }}
              >
                Apoorv Lathey
              </Link>
            </Box>
            <Grid
              item
              style={{
                marginTop: "1rem",
              }}
            >
              <Link
                href="https://apoorvlathey.com/"
                target="_blank"
                rel="noopener"
                style={{
                  color: "white",
                  padding: "1rem",
                  paddingLeft: "0",
                }}
              >
                <Language />
              </Link>
              <Link
                href="https://twitter.com/apoorvlathey"
                target="_blank"
                rel="noopener"
                style={{
                  color: "white",
                  padding: "1rem",
                }}
              >
                <Twitter />
              </Link>
              <Link
                href="https://github.com/CodinMaster"
                target="_blank"
                rel="noopener"
                style={{
                  color: "white",
                  padding: "1rem",
                }}
              >
                <GitHub />
              </Link>
              <Link
                href="https://www.linkedin.com/in/apoorvlathey/"
                target="_blank"
                rel="noopener"
                style={{
                  color: "white",
                  padding: "1rem",
                }}
              >
                <LinkedIn />
              </Link>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default App;
