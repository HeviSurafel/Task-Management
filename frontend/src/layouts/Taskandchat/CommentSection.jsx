import React, { useState } from 'react';
import './taskandchat.css';

const CommentSection = ({ 
  comments, 
  user, 
  selectedTaskId, 
  addComment, 
  formatDate 
}) => {
  const [newComment, setNewComment] = useState({
    text: '',
    role: user?.role || '',
    parentId: null
  });

  const [replyingTo, setReplyingTo] = useState(null);

  const handleCommentChange = (e) => {
    setNewComment({
      ...newComment,
      text: e.target.value
    });
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.text.trim()) return;

    const newCommentObj = {
      text: newComment.text,
      author: {
        _id: user?._id,
        firstName: user?.firstName,
        lastName: user?.lastName,
        avatar: user?.avatar || 'https://i.pinimg.com/736x/91/52/be/9152be177af58cd0aa28a6e0b33b7948.jpg'
      },
      role: user?.role || 'Employee',
      parentId: replyingTo,
    };

    try {
      await addComment(selectedTaskId, newCommentObj);
      setNewComment({
        text: '',
        role: user?.role || '',
        parentId: null
      });
      setReplyingTo(null);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleReply = (commentId) => {
    setReplyingTo(commentId);
    setNewComment(prev => ({
      ...prev,
      parentId: commentId
    }));
    document.getElementById('comment-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const isCurrentUserComment = (commentAuthorId) => {
    return commentAuthorId === user?._id;
  };

  const sortedComments = comments[selectedTaskId]?.sort((a, b) => {
    return new Date(a.timestamp) - new Date(b.timestamp);
  });

  return (
    <div className="comment-container">
      <h3>Comments</h3>
      
      <div className="comment-list">
        {sortedComments?.length === 0 ? (
          <p>No comments yet. Be the first to comment!</p>
        ) : (
          sortedComments?.map((comment) => (
            <div key={comment._id}>
              <div className={`comment ${isCurrentUserComment(comment.author._id) ? 'comment-current-user' : ''}`}>
                {!isCurrentUserComment(comment.author._id) && (
                  <div className="comment-avatar">
                    <img 
                      src={comment.author.avatar || 'https://i.pinimg.com/736x/91/52/be/9152be177af58cd0aa28a6e0b33b7948.jpg'} 
                      alt={comment.author.firstName}
                    />
                  </div>
                )}
                <div className="comment-content">
                  <div className="comment-header">
                    <span className="comment-author">{comment.author.firstName} {comment.author.lastName}</span>
                    <span className="comment-meta">{formatDate(comment.timestamp)}</span>
                    <span className="comment-role">{comment.role}</span>
                  </div>
                  <div className={`comment-content-inner ${isCurrentUserComment(comment.author._id) ? 'current-user-comment' : 'other-user-comment'}`}>
                    <div className="comment-text">{comment.text}</div>
                    <div className="comment-actions">
                      <span 
                        className="comment-action"
                        onClick={() => handleReply(comment._id)}
                      >
                        Reply
                      </span>
                      <span className="comment-action">Like</span>
                    </div>
                  </div>
                </div>
                {isCurrentUserComment(comment.author._id) && (
                  <div className="comment-avatar">
                    <img 
                      src={comment.author.avatar ||  'https://i.pinimg.com/736x/91/52/be/9152be177af58cd0aa28a6e0b33b7948.jpg' } 
                      alt={comment.author.firstName}
                    />
                  </div>
                )}
              </div>

              {/* Comment Replies */}
              {comment.replies?.map((reply) => (
                <div key={reply._id} className="comment-reply">
                  <div className={`comment ${isCurrentUserComment(reply.author._id) ? 'comment-current-user' : ''}`}>
                    {!isCurrentUserComment(reply.author._id) && (
                      <div className="comment-avatar">
                        <img 
                          src={reply.author.avatar || '/default-avatar.png'} 
                          alt={reply.author.firstName}
                        />
                      </div>
                    )}
                    <div className="comment-content">
                      <div className="comment-header">
                        <span className="comment-author">{reply.author.firstName} {reply.author.lastName}</span>
                        <span className="comment-meta">{formatDate(reply.timestamp)}</span>
                        <span className="comment-role">{reply.role}</span>
                      </div>
                      <div className={`comment-content-inner ${isCurrentUserComment(reply.author._id) ? 'current-user-comment' : 'other-user-comment'}`}>
                        <div className="comment-text">{reply.text}</div>
                        <div className="comment-actions">
                          <span 
                            className="comment-action"
                            onClick={() => handleReply(reply._id)}
                          >
                            Reply
                          </span>
                          <span className="comment-action">Like</span>
                        </div>
                      </div>
                    </div>
                    {isCurrentUserComment(reply.author._id) && (
                      <div className="comment-avatar">
                        <img 
                          src={reply.author.avatar || 'https://i.pinimg.com/736x/91/52/be/9152be177af58cd0aa28a6e0b33b7948.jpg'} 
                          alt={reply.author.firstName}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* Comment Form */}
      <form className="comment-form" id="comment-form" onSubmit={handleSubmitComment}>
        <div className="comment-form-avatar">
          <img 
                      src={ 'https://i.pinimg.com/736x/91/52/be/9152be177af58cd0aa28a6e0b33b7948.jpg'} 
           
            alt={user?.firstName}
          />
        </div>
        <div className="comment-input-container">
          <textarea
            className="comment-input"
            value={newComment.text}
            onChange={handleCommentChange}
            placeholder={replyingTo ? 'Write your reply...' : 'Write a comment...'}
            required
            rows="1"
          />
          <div className="comment-buttons">
            {replyingTo && (
              <button
                type="button"
                onClick={() => setReplyingTo(null)}
                className="cancel-reply-button"
              >
                Cancel
              </button>
            )}
            <button 
              type="submit" 
              className="comment-submit"
              disabled={!newComment.text.trim()}
            >
              {replyingTo ? 'Reply' : 'Comment'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CommentSection;