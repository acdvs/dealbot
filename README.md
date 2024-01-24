# IsThereAnyDeal Lookup

A simple Discord bot for getting game discount info from [isthereanydeal.com](https://isthereanydeal.com).

## Usage

1. [Click here][invite-link] to invite the bot to your server.
2. Once the bot has joined, use the commands below in any channel!

## Support the Project

If you like what you see, consider helping with monthly server costs by clicking the "Sponsor" button on the repo or by following [this link][donate-link]. Any amount helps!

## Features

- `/help`  
  Forgot the commands again?
- `/deals [game]`  
  Gets a list of current deals for the specified game. Lookup relies on spelling, so misspellings may return nothing. If an exact match is not found, the bot will attempt to suggest something similar.
- `/top [waitlisted|collected|popular]`  
  Gets the top most waitlisted, collected, or popular games.
- `/sellers` ![admin only][admin-only]  
  Lists all sellers.
- `/ignoredsellers list` ![admin only][admin-only]  
  Lists all ignored sellers. Ignored sellers do not appear in `/deals` lists.
- `/ignoredsellers [add|remove] [seller]` ![admin only][admin-only]  
  Adds or removes an ignored seller. Seller must be spelled exactly as it appears in the `/sellers` command.
- `/ignoredsellers clear` ![admin only][admin-only]  
  Clears all previously added ignored sellers.

![Example usage][example]

## License

IsThereAnyDeal Lookup is licensed under the [MIT License](https://opensource.org/licenses/mit-license.php).

[invite-link]: https://discord.com/api/oauth2/authorize?client_id=722942824999288924&permissions=274877925376&scope=bot
[donate-link]: https://www.patreon.com/acdvs
[admin-only]: docs/public/images/admin_only.png
[example]: docs/public/images/example.gif
