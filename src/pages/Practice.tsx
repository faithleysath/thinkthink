import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

interface Article {
  id: string;
  title: string;
  content: string;
}

export default function Practice() {
  const { articleId } = useParams<{ articleId: string }>();
  const { user } = useAuth();
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReading, setIsReading] = useState(true);
  const [summary, setSummary] = useState('');
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!articleId) return;
      setIsLoading(true);
      const { data, error } = await supabase
        .from('articles')
        .select('id, title, content')
        .eq('id', articleId)
        .single();

      if (error) {
        console.error('Error fetching article:', error);
      } else {
        setArticle(data);
        startTimeRef.current = Date.now();
      }
      setIsLoading(false);
    };

    fetchArticle();
  }, [articleId]);

  const handleFinishReading = () => {
    setIsReading(false);
  };

  const handleSubmitSummary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary || !user || !article || !startTimeRef.current) return;

    const readingDurationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);

    const GEMINI_API_KEY = "AIzaSyA6DTysB4oaayFjG-8hEPohuDzsJ2OL590"; // User-provided key
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    const prompt = `
      You are an expert in linguistic analysis and writing coaching. Your task is to evaluate a user's summary of a given article.
      Analyze the summary based on: Logic Coherence, Grammatical Integrity, Semantic Conciseness, and Content Completeness.
      Provide an overall score from 0-100.
      Give structured, actionable feedback including a general "feedback" string, an array of "paragraph_suggestions", and an array of "sentence_suggestions".
      **Original Article:**
      ---
      ${article.content}
      ---
      **User's Summary:**
      ---
      ${summary}
      ---
      **IMPORTANT**: Your final output must be a single, valid JSON object with keys: "score", "feedback", "paragraph_suggestions", "sentence_suggestions".
    `;

    try {
      // 1. Call Gemini API
      const geminiResponse = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      });

      if (!geminiResponse.ok) {
        throw new Error(`Gemini API request failed: ${geminiResponse.statusText}`);
      }

      const geminiResult = await geminiResponse.json();
      const responseText = geminiResult.candidates[0].content.parts[0].text;
      const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const evaluation = JSON.parse(cleanedText);

      // 2. Save summary and feedback to Supabase
      const { error: insertError } = await supabase
        .from('summaries')
        .insert({
          article_id: article.id,
          user_id: user.id,
          content: summary,
          reading_duration_seconds: readingDurationSeconds,
          ai_score: evaluation.score,
          ai_feedback: evaluation,
          is_featured: evaluation.score > 90
        });

      if (insertError) {
        throw insertError;
      }

      // 3. Notify user
      alert(`Your summary scored: ${evaluation.score}`);
      console.log(evaluation);

    } catch (error) {
      console.error('Error submitting summary:', error);
      alert(`Error: ${(error as Error).message}`);
    }
  };

  if (isLoading) {
    return <div>Loading article...</div>;
  }

  if (!article) {
    return <div>Article not found.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      {isReading ? (
        <div>
          <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
          <div className="prose lg:prose-xl">
            <p>{article.content}</p>
          </div>
          <button 
            onClick={handleFinishReading}
            className="mt-8 px-6 py-3 bg-green-500 text-white font-bold rounded-lg shadow-md hover:bg-green-600"
          >
            I've Finished Reading
          </button>
        </div>
      ) : (
        <div>
          <h1 className="text-2xl font-bold mb-4">Summarize the Article</h1>
          <p className="mb-4 text-gray-600">Without looking back at the original text, please provide a concise summary of its main points.</p>
          <form onSubmit={handleSubmitSummary}>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full p-4 border rounded-lg"
              rows={10}
              placeholder="Write your summary here..."
              required
            />
            <button type="submit" className="mt-4 px-6 py-3 bg-blue-500 text-white font-bold rounded-lg shadow-md hover:bg-blue-600">
              Submit Summary for Evaluation
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
