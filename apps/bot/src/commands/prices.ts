import getListingsCommand from './shared/listings';

const command = getListingsCommand({
  name: 'prices',
  description: 'Get a list of current deals AND non-deals for a game.',
  dealsOnly: false,
});

export default command;
