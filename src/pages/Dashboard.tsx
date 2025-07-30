import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

interface Article {
  id: string;
  title: string;
  created_at: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      if (!user) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('articles')
        .select('id, title, created_at')
        .eq('uploader_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching articles:', error);
      } else {
        setArticles(data);
      }
      setLoading(false);
    };

    fetchArticles();
  }, [user]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content || !user) return;

    const { data, error } = await supabase
      .from('articles')
      .insert([{ title, content, uploader_id: user.id, is_community: false }])
      .select();

    if (error) {
      console.error('Error uploading article:', error);
    } else if (data) {
      setArticles([data[0], ...articles]);
      setTitle('');
      setContent('');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Articles</h1>
      
      <form onSubmit={handleUpload} className="mb-8 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Upload New Article</h2>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 mb-2 border rounded"
          required
        />
        <textarea
          placeholder="Article content..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-2 mb-2 border rounded"
          rows={5}
          required
        />
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Upload
        </button>
      </form>

      <div>
        {articles.map((article) => (
          <Link to={`/practice/${article.id}`} key={article.id} className="block p-4 mb-2 border rounded-lg hover:bg-gray-50">
            <h3 className="font-semibold">{article.title}</h3>
            <p className="text-sm text-gray-500">
              Uploaded on {new Date(article.created_at).toLocaleDateString()}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
