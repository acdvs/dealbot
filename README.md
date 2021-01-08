# IsThereAnyDeal Lookup

A simple Discord bot for getting game discount info from [isthereanydeal.com](https://isthereanydeal.com).

## Usage

1. [Click here][invite-link] to invite the bot to your server.
2. Once the bot has joined, use the commands below in any channel!

## Support the Project

If you like what you see, consider helping with monthly server costs by clicking the "Sponsor" button on the repo or by following [this link][donate-link]. Any amount helps!

## Features

- `$help`  
Forgot the commands again?
- `$deals [game]`  
Gets a list of current deals for the specified game. Lookup relies on spelling, so misspellings may return nothing. If an exact match is not found, the bot will attempt to suggest something similar.
- `$sellers`  
Lists all sellers.
- `$ignoredsellers`  
Lists all ignored sellers. Ignored sellers do not appear in `$deals` lists.
- `$ignoredsellers [add|remove|clear] [seller]`  
Adds or removes an ignored seller. Seller must be spelled exactly as it appears in the `$sellers` command.
- `$top [waitlisted|collected|popular]`  
Gets the top waitlisted, collected, or popular games.

![Look at these deals](resources/readme/deals-example.gif)

## License

IsThereAnyDeal Lookup is licensed under the [MIT License](http://www.opensource.org/licenses/mit-license.php).

[invite-link]: https://discord.com/api/oauth2/authorize?client_id=722942824999288924&permissions=93248&redirect_uri=https%3A%2F%2Fgithub.com%2Facdvs%2Fisthereanydeal-lookup&scope=bot
[donate-link]: https://www.patreon.com/acdvs