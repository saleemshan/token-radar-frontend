export function calculateDifferencesAndPercentageChange(
  data: IndividualTS[],
): SocialAnalytic {
  if (data.length < 2) {
    return {
      mentionsDifference: 0,
      mentionsPercentageChange: 0,
      socialDominanceDifference: 0,
      socialDominancePercentageChange: 0,
      currentMentions: 0,
      currentSocialDominance: 0,
    };
  }

  const first = data[0];
  const last = data[data.length - 1];

  const mentionsDifference = last.mentions - first.mentions;
  const mentionsPercentageChange =
    ((last.mentions - first.mentions) / first.mentions) * 100;

  const socialDominanceDifference =
    last.social_dominance - first.social_dominance;
  const socialDominancePercentageChange =
    ((last.social_dominance - first.social_dominance) /
      first.social_dominance) *
    100;

  return {
    mentionsDifference,
    mentionsPercentageChange,
    socialDominanceDifference,
    socialDominancePercentageChange,
    currentMentions: last.mentions,
    currentSocialDominance: last.social_dominance,
  };
}
