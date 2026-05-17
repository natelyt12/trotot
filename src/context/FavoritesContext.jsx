/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children, user }) => {
    const [favorites, setFavorites] = useState([]); // Array of room IDs
    const [loading, setLoading] = useState(false);

    const fetchFavorites = useCallback(async () => {
        if (!user) {
            setFavorites([]);
            return;
        }

        try {
            setLoading(true);
            const { data, error } = await supabase.from("user_favorites").select("room_id").eq("user_id", user.id);

            if (error) {
                // If table doesn't exist yet, we don't want to crash the app
                if (error.code === "42P01") {
                    console.warn("Table user_favorites does not exist yet. Please run the SQL script.");
                    return;
                }
                throw error;
            }
            setFavorites(data.map((f) => f.room_id));
        } catch (err) {
            console.error("Error fetching favorites:", err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchFavorites();
    }, [fetchFavorites]);

    const isFavorite = useCallback(
        (roomId) => {
            return favorites.includes(roomId);
        },
        [favorites],
    );

    const toggleFavorite = async (roomId) => {
        if (!user) {
            return { error: "login_required" };
        }

        const currentlyFavorite = isFavorite(roomId);

        try {
            if (currentlyFavorite) {
                // Remove
                const { error } = await supabase.from("user_favorites").delete().eq("user_id", user.id).eq("room_id", roomId);

                if (error) throw error;
                setFavorites((prev) => prev.filter((id) => id !== roomId));
            } else {
                // Add
                const { error } = await supabase.from("user_favorites").insert([{ user_id: user.id, room_id: roomId }]);

                if (error) throw error;
                setFavorites((prev) => [...prev, roomId]);
            }
            return { success: true, action: currentlyFavorite ? "removed" : "added" };
        } catch (err) {
            console.error("Error toggling favorite:", err);
            return { error: err.message };
        }
    };

    return (
        <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite, loading, refresh: fetchFavorites }}>{children}</FavoritesContext.Provider>
    );
};

export const useFavorites = () => {
    const context = useContext(FavoritesContext);
    if (!context) {
        throw new Error("useFavorites must be used within a FavoritesProvider");
    }
    return context;
};
