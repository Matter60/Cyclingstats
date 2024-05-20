import axios from 'axios';
import cheerio from 'cheerio';

const generateRiderUrl = (name: string): string => {
    const baseUrl = 'https://www.procyclingstats.com/rider/';
    const urlFriendlyName = name.toLowerCase().replace(/\s+/g, '-');
    return `${baseUrl}${urlFriendlyName}`;
};

export const getRiderData = async (name: string) => {
    const url = generateRiderUrl(name);
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        // Haal de naam op en trim spaties
        let fullName = $('h1').text().trim();

        // Vervang meerdere spaties door een enkele spatie
        fullName = fullName.replace(/\s+/g, ' ');

        const riderInfo = $('.rdr-info-cont');

        const age = riderInfo.find('b:contains("Date of birth:")')[0].nextSibling.nodeValue.trim();
       
        const nationality = riderInfo.find('b:contains("Nationality:")').next('span').next('a').text().trim();
        const weight = riderInfo.find('b:contains("Weight:")')[0].nextSibling.nodeValue.trim();
        const height = riderInfo.find('b:contains("Height:")')[0].nextSibling.nodeValue.trim();
        const placeOfBirth = riderInfo.find('b:contains("Place of birth:")').next('a').text().trim();

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

        return {
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
    } catch (error) {
        console.error(error);
        return { error: 'Error fetching rider data' };
    }
};
