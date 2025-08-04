import getListingsCommand from './shared/listings';

const { options, run, autocomplete } = getListingsCommand({
  name: 'deals',
  description: 'Get a list of current deals for a game.',
  dealsOnly: true,
});

export { options, run, autocomplete };
