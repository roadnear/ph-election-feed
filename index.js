const axios = require('axios');
const formatNumber = require('format-number');
const cTable = require('console.table');

const format = formatNumber({});
const formatRoundUp = formatNumber({ round: 2 });

function start() {
  const countFeed = 20;
  const feedList = []

  for (let index = 0; index < countFeed; index++) {
    feedList.push(getVoteContext(index));
  }

  Promise.all(feedList).then((result) => {
    result.forEach((context) => {
      console.log(`================================== ${context.feed} ===============================`)
      console.log(`-- Total vote: ${format(context.totalVoteCount)} (${formatRoundUp(context.totalVotePercentage)}) as of ${context.timestamp}`)
      console.table(context.result)
    })
  })
}

async function getVoteContext(index) {
  const resultUrl = `https://blob-prod-president.abs-cbn.com/feed-${index + 1}/president-00199000-nation-location-1.json`;
  const response = await axios.get(resultUrl, {
    responseType: 'json'
  });

  const data = response.data;
  const result = data.result;
  const voter = data.voter
  const timestamp = new Date(data.timestamp);
  const totalVotePercentage = voter.count / voter.total * 100;

  const parsedResult = result.map((candidate, index) => ({
    candidateName: candidate.candidateName,
    voteCount: format(candidate.voteCount),
    votePercentage: formatRoundUp(candidate.voteCount / voter.count * 100),
    diffPercentage: index === 0 ? null : formatRoundUp(candidate.voteCount / result[index - 1].voteCount * 100)
  }));

  return {
    result: parsedResult,
    totalVoteCount: voter.count,
    totalVotePercentage: totalVotePercentage,
    timestamp: timestamp,
    feed: `Feed ${index + 1}`
  };
}

start()