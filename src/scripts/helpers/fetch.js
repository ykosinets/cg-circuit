let getData = (url) => {
  return fetch(url)
    .then(response => {
      return !response.ok ? new Error("HTTP error " + response.statusText) : response.json();
    })
};

export default getData;
