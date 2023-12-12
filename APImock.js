const axios = require('axios');
const nock = require('nock');
const fs = require('fs');

// Define the URL you want to mock
const apiUrl = 'https://steamcommunity.com/inventory/76561198148239810/730/2?l=english&count=5000';

// Create a Nock interceptor to mock the HTTP request
nock(apiUrl)
  .get('/')

// Perform the mocked request using Axios
axios.get(apiUrl)
  .then(response => {
    console.log('Mocked Response:', response.data);

    // Save the mocked data to a file (optional)
    const filePath = 'mockedData.json';
    fs.writeFileSync(filePath, JSON.stringify(response.data, null, 2));
    console.log(`Mocked data saved to ${filePath}`);
  })
  .catch(error => {
    console.error('Error:', error.message);
  });