# IsThereAnyDeal Lookup

A simple Discord bot for getting game discount info from [isthereanydeal.com](https://isthereanydeal.com).

## Usage

1. [Click here][invite-link] to invite the bot to your server or look up "IsThereAnyDeal" on the Discord app directory.
2. Once the bot has joined, use the commands below in any channel!

## Support the Project

If you like what you see, consider helping with monthly server costs by clicking the "Sponsor" button on the repo or by following [this link][donate-link]. Any amount helps!

## Commands

### Everyone

- `/help`  
  See the ITAD API status, latest release notes, and links to report a bug or donate.
- `/deals [game]`  
  Gets a list of current deals for a game.
- `/prices [game]`  
  Gets a list of all prices for a game including non-deals.
- `/top [waitlisted|collected|popular]`  
  Gets the top most waitlisted, collected, or popular games.

### Admin-only

- `/sellers`  
  Lists all sellers.
- `/ignoredsellers list`  
  Lists all ignored sellers. Ignored sellers do not appear in `/deals` or `/prices` lists.
- `/ignoredsellers [add|remove] [seller]`  
  Adds or removes an ignored seller.
- `/ignoredsellers clear`  
  Clears all previously added ignored sellers.

![Example usage][example]

## License

IsThereAnyDeal Lookup is licensed under the [MIT License](https://opensource.org/licenses/mit-license.php).

[invite-link]: https://discord.com/api/oauth2/authorize?client_id=722942824999288924&permissions=274877925376&scope=bot
[donate-link]: https://www.patreon.com/acdvs
[example]: docs/public/images/example.gif
