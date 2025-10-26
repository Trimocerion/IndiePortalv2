// CommentForm.tsx
import React, {useState} from 'react';
import {Button, TextField, Typography} from '@mui/material';
import {useSupabaseClient, useUser} from "@supabase/auth-helpers-react";
import {Comment} from "../redux/types";

interface CommentFormProps {
    gameId: string;
    onCommentAdded: (newComment: Comment) => void;
}

/**
 * A form for users to submit comments on a game.
 * @param {object} props - The props for the component.
 * @param {string} props.gameId - The ID of the game being commented on.
 * @param {(newComment: Comment) => void} props.onCommentAdded - Callback function to be called when a new comment is added.
 * @returns {React.ReactElement} The rendered comment form.
 */
const CommentForm: React.FC<CommentFormProps> = ({ gameId, onCommentAdded }) => {
    const [comment, setComment] = useState<string>('');

    const user = useUser();


    const supabase = useSupabaseClient();

    const handleCommentSubmit = async () => {
        try {
            if (!comment.trim()) {
                // Wprowadź walidację komentarza
                return;
            }

            if (!user) {
                // Użytkownik nie jest zalogowany
                return;
            }

            const { data, error } = await supabase
                .from('comments')
                .insert([
                    {
                        game_id: gameId,
                        user_id: user.id,
                        content: comment.trim(),
                    },
                ]).select();

            if (error) {
                console.error('Error adding comment:', error.message);
            } else {
                console.log('Comment added successfully:', data);
                setComment(''); // Wyczyść pole komentarza po dodaniu
                onCommentAdded({ ...data[0], user_id: user.id }); // Odśwież listę komentarzy
            }
        } catch (error) {
            console.error('Error submitting comment:', error);
        }
    };

    return (
        <div>
            {user ? (
                <>
                    <TextField
                        label="Add a comment"
                        multiline
                        rows={4}
                        variant="outlined"
                        fullWidth
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    />
                    <Button variant="contained" color="primary" onClick={handleCommentSubmit}>
                        Add Comment
                    </Button>

                </>
            ) : (
                <Typography variant='h4' color='text.primary' textAlign='center'>Please login to leave a comment.</Typography>
            )}

        </div>
    );
};

export default CommentForm;
