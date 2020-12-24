# IsThereAnyDeal Lookup

A simple Discord bot for getting game discount info from [isthereanydeal.com](https://isthereanydeal.com).

## Requirements

- Node.js v12
- A [Discord bot token](https://discord.com/developers/applications)
- An [isthereanydeal.com API key](https://isthereanydeal.com/dev/app)

## Setup

Clone the repository to any local folder.

Create a `.env` file in the folder with the following contents:

```
BOT_TOKEN=[token]
ITAD_KEY=[key]
```

Replace `[token]` with your Discord bot token. Replace `[key]` with your ITAD API key.

Finally, run the following commands:

```sh
$ npm install
$ node lib/index.js
```

## Features

- `$help`  
Help me help you!
- `$deals [game]`  
Gets a list of current deals for the specified game. Lookup relies on spelling, so misspellings may return nothing. If an exact match is not found, the bot will attempt to suggest something similar.
- `$sellers`  
Lists all sellers.
- `$ignoredsellers`  
Lists all ignored sellers. Ignored sellers do not appear in `$deals` lists.
- `$ignoredsellers [add|remove] [seller]`  
Adds or removes an ignored seller. Seller must be spelled exactly as it appears in the `$sellers` command.
- `$top [waitlisted|collected|popular]`  
Gets the top waitlisted, collected, or popular games.

![Look at these deals](resources/readme/deals-example.gif)

## License

IsThereAnyDeal Lookup is licensed under the [MIT License](http://www.opensource.org/licenses/mit-license.php).
