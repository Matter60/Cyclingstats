import axios from 'axios';
import * as cheerio from 'cheerio';

const BASE_URL = 'https://www.procyclingstats.com/rider/';

interface RiderData {
    name: string;
    age: number;
    nationality: string;
    weight: string;  // Full value like "78 kg"
    height: string;  // Full value like "1.90 m"
    placeOfBirth: string;
    points: Record<string, string>;
    socialMedia: Record<string, string>;
    rankings: Record<string, string>;
    teams: string[];
    imageUrl: string;
}

interface ErrorResponse {
    error: string;
}

const generateRiderUrl = (name: string): string => 
    `${BASE_URL}${name.toLowerCase().replace(/\s+/g, '-')}`;

const extractText = ($: cheerio.CheerioAPI, selector: string): string =>
    $(selector).text().trim();

// Correctly extract the age from the full text, which includes the birthdate and the age in parentheses
const extractAgeFromFullText = (birthDateText: string): number | null => {
    const ageMatch = birthDateText.match(/\((\d+)\)/);
    return ageMatch ? parseInt(ageMatch[1], 10) : null;
};

export const getRiderData = async (name: string): Promise<RiderData | ErrorResponse> => {
    try {
        const { data } = await axios.get(generateRiderUrl(name));
        const $ = cheerio.load(data);

        const fullName = extractText($, 'h1').replace(/\s+/g, ' ');

        const riderInfo = $('.rdr-info-cont');
        
        // Capture the full text for date of birth, including the age in parentheses
        const birthDateText = riderInfo.find('b:contains("Date of birth:")').parent().text().trim();
        
        // Extract age from full text
        const age = birthDateText ? extractAgeFromFullText(birthDateText) : null;

        // Extract nationality
        const nationality = extractText($, '.rdr-info-cont b:contains("Nationality:") + span + a');
        
        // Extract weight (corrected to avoid extra text)
        const weightText = riderInfo.find('b:contains("Weight:")').parent().text().trim();
        const weight = weightText.match(/(\d+(\.\d+)?\s?kg)/)?.[0];  // Extracts "78 kg" or similar

        // Extract height (corrected to avoid extra text)
        const heightText = riderInfo.find('b:contains("Height:")').parent().text().trim();
        const height = heightText.match(/(\d+(\.\d+)?\s?m)/)?.[0];  // Extracts "1.90 m" or similar

        // Extract place of birth
        const placeOfBirth = extractText($, '.rdr-info-cont b:contains("Place of birth:") + a');

        const points: Record<string, string> = {};
        $('.pps ul li').each((_, el) => {
            const specialty = $(el).find('.title').text().trim();
            const pointValue = $(el).find('.pnt').text().trim();
            if (specialty) points[specialty] = pointValue;
        });

        const socialMedia: Record<string, string> = {};
        $('.sites2 li').each((_, el) => {
            const platform = $(el).find('a').text().trim().toLowerCase();
            const link = $(el).find('a').attr('href');
            if (platform && link) socialMedia[platform] = link;
        });

        const rankings: Record<string, string> = {};
        $('.rdr-rankings li').each((_, el) => {
            const rankingType = $(el).find('.title').text().trim();
            const rank = $(el).find('.rnk').text().trim();
            if (rankingType) rankings[rankingType] = rank;
        });

        const teams = $('.rdr-teams li').map((_, el) => 
            $(el).text().trim().replace(/(\d{4})([A-Za-z])/g, '$1 $2')
        ).get();

        const imageUrl = `https://www.procyclingstats.com/${$('.rdr-img-cont img').attr('src') || ''}`;

        return {
            name: fullName,
            age: age ?? NaN,  // Set age to NaN if extraction fails
            nationality,
            weight: weight ?? 'N/A',  // Use "N/A" if weight extraction fails
            height: height ?? 'N/A',  // Use "N/A" if height extraction fails
            placeOfBirth,
            points,
            socialMedia,
            rankings,
            teams,
            imageUrl,
        };
    } catch (error) {
        console.error(`Error fetching rider data: ${(error as Error).message}`);
        return { error: 'Error fetching rider data' };
    }
};
