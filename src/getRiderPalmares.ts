import axios from 'axios';
import * as cheerio from 'cheerio';

interface RaceResult {
    raceWins: string;
    raceType: string;
    raceTitle: string;
    raceYears: string;
}

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

const monumentRaces = [
    'Milano-Sanremo',
    'Ronde van Vlaanderen',
    'Paris-Roubaix',
    'Liège-Bastogne-Liège',
    'Il Lombardia'
];

const generateRiderUrl = (name: string): string =>
    `https://www.procyclingstats.com/rider/${name.toLowerCase().replace(/\s+/g, '-')}`;


export const getRiderPalmares = async (riderName: string): Promise<RaceResult[]> => {
    const url = generateRiderUrl(riderName);
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        const results: RaceResult[] = [];
        $('ul.list.moblist.flex li.main').each((_index, element) => {
            let raceWins = $(element).find('.ar b').text().trim() || 
                           ($(element).find('.ar').text().trim().includes('2nd') ? '2nd' : '1x');
            const raceTypeText = $(element).find('.blue').text().trim();
            const raceTitle = $(element).find('a').text().trim();
            const raceYearsText = $(element).find('span[style="color: #777; font: 11px tahoma;"]').text().trim();

            if (raceYearsText) {
                const raceYears = raceYearsText.replace(/[()']/g, '')
                    .split(/[\s,;]+/)
                    .map(year => year.length === 2 ? `20${year}` : year)
                    .join(', ');
                const raceType = raceTypeText || (monumentRaces.includes(raceTitle) ? 'monument' :
                                  classics.includes(raceTitle) ? 'classics' : 'onedayrace');

                results.push({ raceWins, raceType, raceTitle, raceYears });
            } else {
                console.warn(`No race years found for "${raceTitle}".`);
            }
        });

        return results;
    } catch (error) {
        console.error(`Error fetching data for ${riderName}:`, error);
        return [];
    }
};
