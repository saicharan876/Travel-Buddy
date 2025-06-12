import React, { useState, useEffect } from 'react';
import axios from 'axios';

// A high-quality default image to use if Pexels doesn't find a match or if the API fails.
const FALLBACK_IMAGE_URL = 'https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg';

export default function TripCardImage({ query, altText }) {
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Retrieve the API key from your environment variables.
  const PEXELS_API_KEY = "N2dBYDJ2m0jEssjI4LQMO24PTYZ371F0vCA3BCIi7tJSzqqfAg6bHXfF";

  useEffect(() => {
    // If there's no query or no API key, don't even try to fetch.
    if (!query || !PEXELS_API_KEY) {
      setLoading(false);
      setImageUrl(FALLBACK_IMAGE_URL);
      return;
    }

    const fetchImage = async () => {
      setLoading(true);
      try {
        const response = await axios.get('https://api.pexels.com/v1/search', {
          headers: {
            Authorization: PEXELS_API_KEY
          },
          params: {
            query: query,
            per_page: 1, // We only need one image.
            orientation: 'landscape' // Landscape photos look better in cards.
          }
        });

        // Check if the API returned any photos for the query.
        if (response.data.photos && response.data.photos.length > 0) {
          // Use the 'large' size photo from the response for good quality.
          setImageUrl(response.data.photos[0].src.large);
        } else {
          // If no photo is found, use our fallback image.
          setImageUrl(FALLBACK_IMAGE_URL);
        }
      } catch (error) {
        console.error("Error fetching image from Pexels:", error);
        // If the API call fails for any reason, also use the fallback.
        setImageUrl(FALLBACK_IMAGE_URL);
      } finally {
        setLoading(false);
      }
    };

    fetchImage();
    // This effect should re-run if the search query changes.
  }, [query, PEXELS_API_KEY]);

  // While the image is loading, we'll show a simple gray placeholder.
  if (loading) {
    return <div className="image-loading-placeholder"></div>;
  }

  // Once loading is false, display the actual image.
  return <img src={imageUrl} alt={altText} />;
}