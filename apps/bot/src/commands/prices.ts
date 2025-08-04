import getListingsCommand from './shared/listings';

const { options, run, autocomplete } = getListingsCommand({
  name: 'prices',
  description: 'Get a list of current deals AND non-deals for a game.',
  dealsOnly: false,
});

export { options, run, autocomplete };
