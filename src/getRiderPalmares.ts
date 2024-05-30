import axios from 'axios';
import cheerio from 'cheerio';

// Define the types for the race result
interface RaceResult {
    raceWins: string;
    raceType: string;
    raceTitle: string;
    raceYears: number[];
}

// List of classic race titles
const classics = [
    'Omloop Het Nieuwsblad',
    'Strade Bianche',
    'E3 Saxo Classic',
    'Gent-Wevelgem',
    'Dwars door Vlaanderen',
    'Eschborn-Frankfurt',
    'Amstel Gold Race',
    'La Flèche Wallonne',
    'San Sebastian',
    'Bretagne Classic',
    'GP Québec',
    'GP Montréal',
    'Dwars door Vlaanderen - A travers la Flandre ME'

];

// List of monument race titles
const monumentRaces = [
    'Milano-Sanremo',
    'Ronde van Vlaanderen',
    'Paris-Roubaix',
    'Liège-Bastogne-Liège',
    'Il Lombardia'
];


// Generate the URL for the rider based on their name
const generateRiderUrl = (name: string): string => {
    const baseUrl = 'https://www.procyclingstats.com/rider/';
    const urlFriendlyName = name.toLowerCase().replace(/\s+/g, '-');
    return `${baseUrl}${urlFriendlyName}`;
};

// Parse and standardize race years
const parseRaceYears = (raceYearsText: string): number[] => {
    // Remove parentheses and single quotes
    raceYearsText = raceYearsText.replace(/[()']/g, '');
    // Assuming years might be separated by commas or other delimiters
    const yearTokens = raceYearsText.split(/[\s,;]+/);
    const years = yearTokens.map(year => {
        if (year.length === 2) {
            return parseInt(`20${year}`, 10); // Assuming 21st century if only 2 digits
        }
        return parseInt(year, 10);
    }).filter(year => !isNaN(year)); // Remove any invalid numbers
    return years;
};

// Fetch and parse the rider data
export const getRiderPalmares = async (riderName: string): Promise<RaceResult[]> => {
    const url = generateRiderUrl(riderName);
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        // Select the list items
        const results: RaceResult[] = [];
        $('ul.list.moblist.flex li.main').each((index, element) => {
            let raceWins = $(element).find('.ar b').text().trim() || '';
            if (!raceWins) {
                raceWins = $(element).find('.ar').text().trim();
                raceWins = raceWins.includes('2nd') ? '2nd' : '1x';
            }
            let raceType = $(element).find('.blue').text().trim() || '';
            const raceTitle = $(element).find('a').text().trim();
            const raceYearsText = $(element).find('span[style="color: #777; font: 11px tahoma;"]').text().trim();
            
            if (!raceYearsText) {
                console.warn(`No race years found for "${raceTitle}".`);
            } else {
                const raceYears = parseRaceYears(raceYearsText);
                if (!raceType) {
                    if (monumentRaces.includes(raceTitle)) {
                        raceType = 'monument';
                    } else if (classics.includes(raceTitle)) {
                        raceType = 'classics';
                    } else {
                        raceType = 'onedayrace';
                    }
                }

                results.push({
                    raceWins,
                    raceType,
                    raceTitle,
                    raceYears
                });
            }
        });

        return results;
    } catch (error) {
        console.error(`Error fetching data for ${riderName}:`, error);
        return [];
    }
};
