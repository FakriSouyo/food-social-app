// src/pages/NewPost.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import NewPostForm from '../components/NewPostForm';

const NewPost = () => {
  const navigate = useNavigate();

  const handlePostCreated = () => {
    navigate('/');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create New Post</h1>
      <NewPostForm onPostCreated={handlePostCreated} />
    </div>
  );
};

export default NewPost;