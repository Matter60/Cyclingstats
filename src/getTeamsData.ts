import axios from "axios";
import { load } from "cheerio";

export async function getTeamsData() {
  const url = "https://www.procyclingstats.com/teams/";
  const baseImageUrl = "https://www.procyclingstats.com/";
  const response = await axios.get(url);
  const $ = load(response.data);

  const teams = $("ul.list.fs14.columns2.mob_columns1 li").map((_index, element) => {
    const teamName = $(element).find("a").attr("href")?.split("/").pop() ?? "";
    const numOfRidersText = $(element).find("div").eq(1).text().trim();
    const numOfRiders = parseInt(numOfRidersText.replace(/[()]/g, ""), 10);

    return {
      name: teamName,
      riders: isNaN(numOfRiders) ? null : numOfRiders,
      jersey: "", // Placeholder voor jersey URL, wordt later geüpdatet
    };
  }).get();

  $("div.mt20 span.table-cont ul.list.horizontal li").each((_index, element) => {
    const teamName = $(element).find("a").attr("href")?.split("/").pop() ?? "";
    let tshirtUrl = $(element).find("img").attr("src");

    if (tshirtUrl && !tshirtUrl.startsWith("http")) {
      tshirtUrl = `${baseImageUrl}${tshirtUrl}`;
    }

    const team = teams.find((team) => team.name === teamName);
    if (team) {
      team.jersey = tshirtUrl ?? "";
    }
  });

  return teams;
}
