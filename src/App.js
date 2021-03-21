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
const erc20ABI = require("./abis/ERC20.json");
const erc1155ABI = require("./abis/ERC1155.json");
const exchangeABI = require("./abis/Exchange.json");
// Address (Matic Testnet)
const stableAddress = "0x3dEb26547a55F9ef8885e34d79Dd9c425b87D4e6";
const nftAddress = "0x027125316C87e5fdA12881248fD00fb81a770DB5";
const exchangeAddress = "0xa2DB9cd5aB3E891cE129B631F5863155e5762fDd";
const nftID = 10;
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
  const [stableContract, setStableContract] = useState();
  const [nftContract, setNftContract] = useState();
  const [exchangeContract, setExchangeContract] = useState();
  const [lpTokenContract, setLpTokenContract] = useState();

  // user balances
  const [stableBalance, setStableBalance] = useState("0");
  const [nftBalance, setNftBalance] = useState("0");
  const [lpBalance, setLpBalance] = useState("0");
  // pool balances
  const [stablePoolBalance, setStablePoolBalance] = useState("0");
  const [nftPoolBalance, setNftPoolBalance] = useState("0");
  // swap
  const [nftAmtToSwap, setNftAmtToSwap] = useState("");
  const [usdcBought, setUsdcBought] = useState("");

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

  // initialize contracts
  useEffect(() => {
    if (web3) {
      setInputDisabled(false);

      setStableContract(new web3.eth.Contract(erc20ABI, stableAddress));
      setNftContract(new web3.eth.Contract(erc1155ABI, nftAddress));
      setExchangeContract(new web3.eth.Contract(exchangeABI, exchangeAddress));
      setLpTokenContract(new web3.eth.Contract(erc20ABI, exchangeAddress));
    }
  }, [web3]);

  // fetch user balances
  useEffect(() => {
    if (account && stableContract && nftContract && lpTokenContract) {
      fetchUserBalances();
      fetchPoolBalances();
    }
  }, [account, stableContract, nftContract, lpTokenContract]);

  // swap quote
  useEffect(() => {
    if(nftAmtToSwap) {
      getSwapQuote()
    }
  }, [nftAmtToSwap])

  const fetchUserBalances = async () => {
    setLoading(true);

    setStableBalance(
      numberWithCommas(
        await toDecimal(
          null,
          await stableContract.methods.balanceOf(account).call(),
          true
        )
      )
    );
    setNftBalance(
      numberWithCommas(
        await nftContract.methods.balanceOf(account, nftID).call()
      )
    );
    setLpBalance(
      numberWithCommas(
        await toDecimal(
          null,
          await lpTokenContract.methods.balanceOf(account).call(),
          true
        )
      )
    );

    setLoading(false);
  };

  const fetchPoolBalances = async () => {
    setLoading(true);

    setStablePoolBalance(
      numberWithCommas(
        await toDecimal(
          null,
          await stableContract.methods.balanceOf(exchangeAddress).call(),
          true
        )
      )
    );
    setNftPoolBalance(
      numberWithCommas(
        await nftContract.methods.balanceOf(exchangeAddress, nftID).call()
      )
    );

    setLoading(false);
  };

  const getSwapQuote = async () => {
    setLoading(true)
    setUsdcBought(
      numberWithCommas(
        await toDecimal(
          null,
          await exchangeContract.methods.getPriceNftToStable(nftAmtToSwap).call(),
          true
        )
      )
    );
    setLoading(false)
  };

  const swap = () => {};

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
      >
        {/* User Balances */}
        <Grid container justify="space-between">
          <Typography variant="button" display="block" gutterBottom>
            USDC Balance: {stableBalance}
          </Typography>
          <Typography variant="button" display="block" gutterBottom>
            Sword NFT Balance: {nftBalance}
          </Typography>
          <Typography variant="button" display="block" gutterBottom>
            LP Balance: {lpBalance}
          </Typography>
        </Grid>
        <Grid
          container
          justify="space-between"
          style={{
            marginTop: "40px",
          }}
        >
          <Grid item>
            <img alt="NFT image" src="./sword.png" />
            <Typography variant="button" display="block" gutterBottom>
              Pool USDC Balance: {stablePoolBalance}
            </Typography>
            <Typography variant="button" display="block" gutterBottom>
              Pool Sword NFT Balance: {nftPoolBalance}
            </Typography>
          </Grid>
          <Grid item>
            <Box
              fontWeight="fontWeightBold"
              fontSize="1.2rem"
              fontFamily="fontFamily"
              fontStyle=""
              color="black"
              marginBottom="35px"
            >
              SELL SWORD(ERC-1155) FOR USDC
            </Box>
            {inputDisabled && (
              <Grid item>
                <Box
                  fontWeight="fontWeightBold"
                  fontFamily="fontFamily"
                  color="#ff6961"
                >
                  Connect Wallet to Continue ⬈
                </Box>
              </Grid>
            )}
            <Grid item>
              <TextField
                id="sword-amount"
                label="Enter Sword Amount"
                variant="outlined"
                style={{
                  minWidth: "450px",
                }}
                autoComplete="off"
                disabled={inputDisabled}
                value={nftAmtToSwap}
                type="number"
                onChange={(e) => {
                  setNftAmtToSwap(e.target.value);
                }}
              />
            </Grid>
            <Grid
              item
              style={{
                marginTop: "10px",
              }}
            >
              {nftAmtToSwap > 0 && usdcBought && (
                <Typography variant="button" display="block" gutterBottom>
                  {nftAmtToSwap} Sword{nftAmtToSwap > 1 ? "s" : ""} --> {usdcBought} USDC
                </Typography>
              )}
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                style={{
                  minHeight: "55px",
                  minWidth: "125px",
                  marginLeft: "162px",
                  marginTop: "30px",
                }}
                disabled={inputDisabled}
                onClick={() => swap()}
              >
                Swap
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
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
