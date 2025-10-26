/* eslint-disable import/no-anonymous-default-export */
import {NextApiRequest, NextApiResponse} from "next";
import {supabase} from "../../utility/supabaseClient";

type Game = {
    title: string;
    description: string;
    cover_image_url: string;
    release_date: string;
    platforms: any[];
    genres: any[];
    developer: string;
    publisher: string;
};

/**
 * An API route to fetch all games from the database.
 * @param {NextApiRequest} req - The request object.
 * @param {NextApiResponse} res - The response object.
 * @returns {Promise<void>}
 */
export default async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        // Fetch games
        let { data: gamesData, error: gamesError, status: gamesStatus } = await supabase.from("games").select("*");
        if (gamesError) {
            console.error(gamesError);
            return res.status(500).json({ message: "An error occurred while fetching data." });
        }


        res.status(200).json(gamesData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred while fetching data." });
    }
};
