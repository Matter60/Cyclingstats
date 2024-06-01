import axios from "axios";
import { load } from "cheerio";

export async function getTeamsData() {
  const url = "https://www.procyclingstats.com/teams/";
  const response = await axios.get(url);
  const $ = load(response.data);

  const teams: {
    name: string;
    riders: number | null;
    tshirt: string;
  }[] = [];

  // Select all list items in the given HTML structure
  $("ul.list.fs14.columns2.mob_columns1 li").each((_index, element) => {
    const teamName = $(element).find("a").attr("href")?.split("/").pop() ?? "";
    const numOfRidersText = $(element).find("div").eq(1).text().trim();
    const numOfRiders = parseInt(numOfRidersText.replace(/[()]/g, ""), 10); // Remove parentheses and parse as integer

    teams.push({
      name: teamName,
      riders: isNaN(numOfRiders) ? null : numOfRiders,
      tshirt: "", // Initialize tshirt URL to empty string
    });
  });

  // Select the container with t-shirts
  const tshirtContainer = $("div.mt20 span.table-cont ul.list.horizontal li");

  // Iterate over each t-shirt item and update the corresponding team object
  tshirtContainer.each((_index, element) => {
    const teamName = $(element).find("a").attr("href")?.split("/").pop() ?? "";
    let tshirtUrl = $(element).find("img").attr("src");

    // Prepend "https://www.procyclingstats.com/" if tshirtUrl doesn't start with "http" or "https"
    if (tshirtUrl && !tshirtUrl.startsWith("http")) {
      tshirtUrl = `https://www.procyclingstats.com/${tshirtUrl}`;
    }

    const teamIndex = teams.findIndex((team) => team.name === teamName);
    if (teamIndex !== -1) {
      teams[teamIndex].tshirt = tshirtUrl ?? "";
    }
  });

  return teams;
}
