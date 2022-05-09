const axios = require('axios');
const formatNumber = require('format-number');
const cTable = require('console.table');

const format = formatNumber({});
const formatRoundUp = formatNumber({ round: 2 });

function start() {
  const countFeed = 20;
  const presidentFeedList = [];
  const vicePresidentFeedList = [];

  for (let index = 0; index < countFeed; index++) {
    presidentFeedList.push(getVoteContext(index, TYPES.PRESIDENT));
    vicePresidentFeedList.push(getVoteContext(index, TYPES.VICE_PRESIDENT));
  }

  Promise.all(presidentFeedList).then((result) => {
    console.log(`================================== PRESIDENT ===============================`)
    result.forEach((context) => {
      console.log(`================================== ${context.feed} ===============================`)
      console.log(`-- Total vote: ${format(context.totalVoteCount)} (${formatRoundUp(context.totalVotePercentage)}) as of ${context.timestamp}`)
      console.table(context.result)
    })
  });

  Promise.all(vicePresidentFeedList).then((result) => {
    console.log(`================================ VICE PRESIDENT =============================`)
    result.forEach((context) => {
      console.log(`================================== ${context.feed} ===============================`)
      console.log(`-- Total vote: ${format(context.totalVoteCount)} (${formatRoundUp(context.totalVotePercentage)}) as of ${context.timestamp}`)
      console.table(context.result)
    })
  });
}
// https://blob-prod-vice-president.abs-cbn.com/feed-20/vice-president-00299000-nation-location-1.json
const PREFIX_URL = {
  PRESIDENT : 'president-00199000',
  VICE_PRESIDENT: 'vice-president-00299000'
}
const SUB_DOMAIN = {
  PRESIDENT: 'blob-prod-president',
  VICE_PRESIDENT: 'blob-prod-vice-president'
};
const TYPES = {
  PRESIDENT: 'PRESIDENT',
  VICE_PRESIDENT: 'VICE_PRESIDENT'
}
async function getVoteContext(index, type) {
  const resultUrl = `https://${SUB_DOMAIN[type]}.abs-cbn.com/feed-${index + 1}/${PREFIX_URL[type]}-nation-location-1.json`;
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