import axios from 'axios';
import * as cheerio from 'cheerio';

const generateRiderUrl = (name: string): string => {
    const baseUrl = 'https://www.procyclingstats.com/rider/';
    const urlFriendlyName = name.toLowerCase().replace(/\s+/g, '-');
    return `${baseUrl}${urlFriendlyName}`;
};

interface RiderData {
    name: string;
    age: string;
    nationality: string;
    weight: string;
    height: string;
    placeOfBirth: string;
    points: { [key: string]: string };
    socialMedia: { [key: string]: string };
    rankings: { [key: string]: string };
    teams: string[];
    imageUrl: string;
}

interface ErrorResponse {
    error: string;
}

const getTextNodeValue = (element: cheerio.Element): string => {
    const nextNode = element.nextSibling;
    if (nextNode && nextNode.type === 'text') {
        return nextNode.data.trim();
    }
    return '';
};

export const getRiderData = async (name: string): Promise<RiderData | ErrorResponse> => {
    const url = generateRiderUrl(name);
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        // Haal de naam op en trim spaties
        let fullName = $('h1').text().trim();

        // Vervang meerdere spaties door een enkele spatie
        fullName = fullName.replace(/\s+/g, ' ');

        const riderInfo = $('.rdr-info-cont');

        const ageElement = riderInfo.find('b:contains("Date of birth:")')[0];
        const age = ageElement ? getTextNodeValue(ageElement) : '';

        const nationalityElement = riderInfo.find('b:contains("Nationality:")').next('span').next('a');
        const nationality = nationalityElement.length > 0 ? nationalityElement.text().trim() : '';

        const weightElement = riderInfo.find('b:contains("Weight:")')[0];
        const weight = weightElement ? getTextNodeValue(weightElement) : '';

        const heightElement = riderInfo.find('b:contains("Height:")')[0];
        const height = heightElement ? getTextNodeValue(heightElement) : '';

        const placeOfBirthElement = riderInfo.find('b:contains("Place of birth:")').next('a');
        const placeOfBirth = placeOfBirthElement.length > 0 ? placeOfBirthElement.text().trim() : '';

        const points: { [key: string]: string } = {};
        $('.pps ul li').each((i, el) => {
            const specialty = $(el).find('.title').text().trim();
            const pointValue = $(el).find('.pnt').text().trim();
            points[specialty] = pointValue;
        });

        const socialMedia: { [key: string]: string } = {};
        $('.sites li').each((i, el) => {
            const platform = $(el).find('span').attr('class')?.split(' ')[1];
            const link = $(el).find('a').attr('href');
            if (platform && link) {
                socialMedia[platform] = link;
            }
        });

        const rankings: { [key: string]: string } = {};
        $('.rdr-rankings li').each((i, el) => {
            const rankingType = $(el).find('.title').text().trim();
            const rank = $(el).find('.rnk').text().trim();
            rankings[rankingType] = rank;
        });
        
        const teams = $('.rdr-teams li').map((i, el) => {
            let team = $(el).text().trim();
            team = team.replace(/(\d{4})([A-Za-z])/g, '$1 $2'); // Add space after the year
            return team;
        }).get();

        const imageUrl = "https://www.procyclingstats.com/" + $('.rdr-img-cont img').attr('src');

        const riderData: RiderData = {
            name: fullName,
            age,
            nationality,
            weight,
            height,
            placeOfBirth,
            points,
            socialMedia,
            rankings,
            teams,
            imageUrl,
        };

        return riderData;
    } catch (error) {
        console.error(error);
        return { error: 'Error fetching rider data' };
    }
};
