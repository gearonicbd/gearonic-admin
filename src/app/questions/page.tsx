"use client";

import { useEffect, useState } from "react";
import { apiUrl } from "@/lib/api";

interface Question {
  id: string;
  question: string;
  answer?: string | null;
  createdAt: string;
  product: { id: string; title: string; slug: string };
  user: { name?: string | null; email?: string | null };
}

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [status, setStatus] = useState<"all" | "answered" | "unanswered">(
    "all"
  );
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const load = async () => {
    try {
      setLoading(true);
      const query = status === "all" ? "" : `?status=${status}`;
      const res = await fetch(apiUrl(`/api/admin/questions${query}`), {
        cache: "no-store",
      });
      const json = await res.json();
      setQuestions(json || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [status]);

  const submitAnswer = async (id: string) => {
    const answer = drafts[id];
    if (!answer) return alert("Write an answer first");
    try {
      await fetch(apiUrl(`/api/admin/questions/${id}/answer`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer }),
      });
      setDrafts((prev) => ({ ...prev, [id]: "" }));
      load();
    } catch (err) {
      console.error(err);
      alert("Failed to submit answer");
    }
  };

  return (
    <div className="px-4 py-6 sm:px-0 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Questions</h1>
          <p className="text-sm text-gray-600">
            Answer customer questions per product. Filter by
            answered/unanswered.
          </p>
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as "all" | "answered" | "unanswered")}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="all">All</option>
          <option value="unanswered">Unanswered</option>
          <option value="answered">Answered</option>
        </select>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading questions...</p>
      ) : (
        <div className="space-y-4">
          {questions.map((q) => (
            <div
              key={q.id}
              className="bg-white border rounded-lg shadow p-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">
                    {new Date(q.createdAt).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    {q.user?.name || "User"} ({q.user?.email || "No email"})
                  </div>
                </div>
                <div className="text-sm font-semibold text-blue-700">
                  {q.product.title}
                </div>
              </div>
              <p className="text-gray-900 font-medium">{q.question}</p>
              {q.answer ? (
                <div className="bg-green-50 border border-green-200 rounded p-3 text-sm text-green-800">
                  Answer: {q.answer}
                </div>
              ) : (
                <div className="space-y-2">
                  <textarea
                    placeholder="Write your answer"
                    value={drafts[q.id] ?? ""}
                    onChange={(e) =>
                      setDrafts((prev) => ({ ...prev, [q.id]: e.target.value }))
                    }
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    rows={3}
                  />
                  <button
                    onClick={() => submitAnswer(q.id)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
                  >
                    Send Answer
                  </button>
                </div>
              )}
            </div>
          ))}
          {questions.length === 0 && (
            <p className="text-sm text-gray-500">No questions found.</p>
          )}
        </div>
      )}
    </div>
  );
}
