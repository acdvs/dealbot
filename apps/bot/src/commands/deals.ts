import getListingsCommand from './shared/listings';

const command = getListingsCommand({
  name: 'deals',
  description: 'Get a list of current deals for a game.',
  dealsOnly: true,
});

export default command;
