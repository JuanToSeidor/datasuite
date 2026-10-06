import { useState, useEffect } from 'react';

let cachedNewsData: any = null;
let fetchPromise: Promise<any> | null = null;

export function useNewsData() {
  const [data, setData] = useState<any>(cachedNewsData);
  const [loading, setLoading] = useState<boolean>(!cachedNewsData);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (cachedNewsData) {
      setData(cachedNewsData);
      setLoading(false);
      return;
    }

    if (!fetchPromise) {
      fetchPromise = fetch('https://raw.githubusercontent.com/SeidorA/DocuCrestone/refs/heads/main/docs/releasenotes/news.json')
        .then(res => {
          if (!res.ok) throw new Error("Failed to fetch news");
          return res.json();
        })
        .then(jsonData => {
          cachedNewsData = jsonData;
          return jsonData;
        });
    }

    fetchPromise
      .then(jsonData => {
        setData(jsonData);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, []);

  return { data, loading, error };
}
