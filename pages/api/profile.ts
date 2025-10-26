/* eslint-disable import/no-anonymous-default-export */
import {NextApiRequest, NextApiResponse} from "next";
import {supabase} from "../../utility/supabaseClient";
import {useUser} from '@supabase/auth-helpers-react'

type Profile = {
  username: string;
  avatar_url: string;
  email: string;
  role:string
};

/**
 * An API route to fetch the profile of the authenticated user.
 * @param {NextApiRequest} req - The request object.
 * @param {NextApiResponse} res - The response object.
 * @returns {Promise<void>}
 */
export default async (req: NextApiRequest, res: NextApiResponse) => {
    const user  = useUser();
  try {
    if (!user || !user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    // Pobierz profil uzytkownika z bazy danych
    let { data, error, status } = await supabase
      .from("profiles")
      .select(`*`)
      .eq("id", user.id)
      .single();
    // Zwroc dane
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching Profile data." });
  }
};
