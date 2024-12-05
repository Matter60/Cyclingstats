# Cyclingstats 🚴🚴

This is a project to get rider stats scraped from PCS using cheerio. The project is a work in progress and will be updated as I learn more about cheerio and web scraping.

## Installation

1. Clone the repository
2. Run `npm install` to install the dependencies
3. Run `npm i wrangler -D` to install wrangler globally
4. Run `npm run dev` to start the api server

## Features 🚀

### `/rider/:name`

This endpoint will return the rider stats for the given rider name. The rider name should be the same as the one on PCS.
For example, `/rider/primoz-roglic` will return the stats for Primoz Roglic.
The stats include the rider's birth, height, weight and more stats.

### `/rider/palmares/:name`

This endpoint will return the rider palmares for the given rider name. The rider name should be the same as the one on PCS.
For example, `/rider/palmares/primoz-roglic` will return the palmares for Primoz Roglic.

## Roadmap 🗺️

- [x] Get rider stats
- [ ] Get all teams
- [ ] Get data per team
- [ ] Get rider palmares
- [ ] Latest results by year with sorting asc desc

## Contributing

If you want to contribute to the project, feel free to open an issue or a pull request. I'm open to suggestions and improvements.

## Credits

- [ProCyclingStats](https://www.procyclingstats.com/) for the data
- [Cheerio](https://cheerio.js.org/) for the web scraping
- [Hono.js](https://hono.dev/) for the API server
