async function retryOnFail(fn, attempts) {
  let output;
  let error;
  for (let i = 0; i < attempts; i++) {
    try {
      output = await fn();
      break;
    } catch (e) {
      error = e;
      console.log(`Error on attempt ${i + 1} - ${e}`);
    }
  }
  return { output, error };
}

async function isTimePassed(time) {
  const now = new Date();
  return now.getTime() >= time;
}

module.exports = { retryOnFail, isTimePassed };
