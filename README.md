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
$ node index.js
```

## Features

- `!deals [game]`  
Gets a list of current deals for the specified game including an ITAD link, store names, discount percentage, and current and original prices.  
Replace `[game]` with a full game name. Lookup relies on spelling, so misspellings may return nothing.

## License

IsThereAnyDeal Lookup is licensed under the [MIT License](http://www.opensource.org/licenses/mit-license.php).
