// Example Netlify function
exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello from Netlify Function!" }),
    headers: {
      'Content-Type': 'application/json',
    },
  };
};
