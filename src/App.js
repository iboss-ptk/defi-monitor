import './App.css';
import LPABI from './lp-abi.json'
import Contract from 'web3-eth-contract';
import { useState } from 'react';
import useInterval from './useInterval';
import axios from 'axios';

Contract.setProvider('https://bsc-dataseed2.defibit.io/')

const lpAddress = "0xf5c3287bb9500dd75b35a13a3ef1771207b248ca"
const tempestAddress = "0xde866dD77b6DF6772e320dC92BFF0eDDC626C674"

const pancakeswapPrice = axios.get("https://api.pancakeswap.com/api/v1/price")
const price =  async (token) => {
  const { prices } = (await pancakeswapPrice).data
  return prices[token]
}


const contract = new Contract(LPABI, lpAddress);

const exa = Math.pow(10, -18)


const totalSupply = async () =>
  contract.methods.totalSupply().call()

const getReserves = async () =>
  contract.methods.getReserves().call()

const balanceOf = async (address) =>
  contract.methods.balanceOf(address).call()

const kLast = async () =>
  contract.methods.kLast().call()

const readableReserves = ({_reserve0, _reserve1}) => ({
  btesta: _reserve0, bnb: _reserve1
})

function App() {
  const [totalLPSupply, setTotalLPSupply] = useState(0)
  const [reserves, setReserves] = useState({})
  const [values, setValues] = useState({ bnb: 0, btesta: 0 })
  const [myLp, setMyLP] = useState(215.064)
  const [opened, setOpened] = useState(false)
  useInterval(async () => {
    try {
      const _reserves = await getReserves();
      // const k = await kLast()
      setReserves({...readableReserves(_reserves), blockTimestamp: _reserves._blockTimestampLast});
      setTotalLPSupply(await totalSupply());
      const { btesta, bnb } = reserves
      console.log(reserves)
      const bnbValue = await price('WBNB') // proxy price for bnb in pancake
      const btestaValue = (bnb / btesta) * bnbValue
      setValues({ bnb: bnbValue, btesta: btestaValue })

      // if (!opened && values.btesta < 0.45 || values.btesta > 0.55 ) {
      //   setOpened(true)
      //   window.open("https://www.youtube.com/watch?v=WL1foQKD3OI&autoplay=1");
      // }
      
    } catch (e) {
      console.warn(e)
    }
  }, 1000)
  
  const MY_LP_PERCENT = 0.33
  const myBNB = (myLpPercent) => myLpPercent * reserves.bnb
  const myBTESTA = (myLpPercent) => myLpPercent * reserves.btesta

  return (
    <div className="App">
      <header className="App-header">
        <b>BTESTA-BNB LP</b>
        <br/>
        BNB: {values.bnb} | reserve: {reserves.bnb * exa}
        <br/>
        BTESTA: {values.btesta} | reserve: {reserves.btesta * exa}
        <br/>
        Total Supply: {totalLPSupply * exa}
        <br/>
        -----
        {/* <input onChange={e => setMyLP(e.target.value)} value={myLp} type="number" /> */}
        <br/>
        MY LP%: { MY_LP_PERCENT }
        <br/>
        MY BNB: { myBNB(MY_LP_PERCENT) * exa }
        <br/>
        MY BTESTA: { myBTESTA(MY_LP_PERCENT) * exa }
        <br/>
        MY TOTAL VALUE: { 
          ((myBTESTA(MY_LP_PERCENT) * exa) * values.btesta) + 
          ((myBNB(MY_LP_PERCENT) * exa) * values.bnb)
        }
        <br/>
        -----
        <br/>
        at: {reserves.blockTimestamp}
        <button disabled={!opened} onClick={() => setOpened(false)} > Reset Alert </button>
      </header>
    </div>
  );
}

export default App;
