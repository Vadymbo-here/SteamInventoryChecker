const axios = require('axios');
require('dotenv').config()

const delayBetweenCalls = 5500; // ms 
const dollarPrice = 36.85; // hardcoded USD

async function fetchData() {
    // Check if in development or testing environment
    const isDeveloping = true; 
    
    if (isDeveloping) {
      // Use the mocked data
      const mockedData = require('./mockedData.json'); // Assuming you saved the mocked data to a file
      return mockedData;
    } else {
      // Use the real API
      const apiUrl = `https://steamcommunity.com/inventory/${process.env.API_KEY}/730/2?l=english&count=5000`;
      try {
        const response = await axios.get(apiUrl);
        return response.data;
      } catch (error) {
        console.error('Error:', error.message);
        throw error; // Propagate the error if needed
      }
    }
  }

fetchData()
  .then(data => {
    filterData(data);
  })
  .catch(error => {
    console.error('Error:', error.message);
  });

const getTradableData = (data) => data.descriptions.filter(el => el.tradable == 1)
const getMarketableData = (data) => data.descriptions.filter(el => el.marketable == 1)

const getNameByClassid = (data, id) => {
  
}

const getSteamPriceByHash = async (hash) => {
  const apiUrl = `https://steamcommunity.com/market/priceoverview/?appid=730&&market_hash_name=${hash}`;
  try {
    const response = await axios.get(apiUrl);
    // console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response.statusText);
    // throw error; // Propagate the error if needed
  }
}

async function processTradableItems(index, tradableItems, countedAssets) {
  let total = 0.0;
  if (index < tradableItems.length-35) {
    const el = tradableItems[index];
    let itemCount = countedAssets[el.classid];
    
    // format price to num
    let {lowest_price} = await getSteamPriceByHash(el.market_hash_name);
    let lowPrice = parseFloat(lowest_price.replace('$','')); 
    total += (lowPrice) ? lowPrice*itemCount : 0.0;

    console.log(`Name: ${el.name}\nCount: ${itemCount}\nPrice: ${lowest_price}\tTotal: $${lowPrice*itemCount}`);
    
    setTimeout(() => {
      processTradableItems(index + 1, tradableItems, countedAssets); // Call the next item after the delay
    }, delayBetweenCalls);
  }else{
    console.log(`Finish! Your total is $${total} in UAH - ${total*dollarPrice}`);
  }
}

const filterData = (data, filter) => {
    let tradableItems = getMarketableData(data);
    // tradableItems.map(el => console.log(el.name));
    let {assets} = data;
    
    let countedAssets = assets.reduce((acc, value) => {
      return {
        ...acc,
        [value.classid]: (acc[value.classid] || 0) + 1,
      }
    })
    
    processTradableItems(0, tradableItems, countedAssets)
}
