import React from 'react';

const Comments = ({ comments, onDelete }) => {
    return (
        <div className="comments-pane">
            <h3>Comments</h3>
            <ul>
                {comments.map((comment, index) => (
                    <li key={index}>
                        {comment.text} 
                        <button onClick={() => onDelete(index)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Comments;
