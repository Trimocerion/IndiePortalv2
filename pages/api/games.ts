/* eslint-disable import/no-anonymous-default-export */
import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../utility/supabaseClient";
import { useUser } from "@supabase/auth-helpers-react";

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
