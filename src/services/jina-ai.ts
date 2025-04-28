
/**
 * Extracts text content from a given URL using the Jina AI Reader API.
 *
 * @param url The URL to scrape.
 * @returns A promise that resolves to the extracted text content, or null if scraping fails.
 */
export async function scrapeTextFromUrl(url: string): Promise<string | null> {
  const jinaReaderUrl = `https://r.jina.ai/${encodeURIComponent(url)}`;
  const apiKey = process.env.JINA_API_KEY; // Access the Jina AI API key from environment variables

  const headers: HeadersInit = {
    'Accept': 'application/json', // Request JSON response
    ...(apiKey && { 'Authorization': `Bearer ${apiKey}` }), // Include API key if it exists
    'X-Return-Format': 'text', // Explicitly request text content
  };

  try {
    console.log(`Attempting to scrape: ${url} via Jina AI`);
    if (!apiKey) {
        console.warn('JINA_API_KEY environment variable not set. Proceeding without authentication, which might be rate-limited or restricted.');
    }

    const response = await fetch(jinaReaderUrl, {
      method: 'GET',
      headers: headers,
    });

    if (!response.ok) {
      // Attempt to get more specific error info from Jina
      let errorBody = 'Unknown error';
      try {
        const errorJson = await response.json();
        errorBody = errorJson.error?.message || JSON.stringify(errorJson);
      } catch (parseError) {
         errorBody = await response.text(); // Fallback to text if JSON parsing fails
      }
      console.error(`Jina AI request failed for ${url}: ${response.status} ${response.statusText}. Body: ${errorBody}`);
      // Provide a more user-friendly error message based on status code if possible
      if (response.status === 401 || response.status === 403) {
        throw new Error(`Jina AI Authentication/Authorization failed. Please check your JINA_API_KEY.`);
      } else if (response.status === 429) {
         throw new Error(`Jina AI Rate Limit Exceeded. Please wait and try again or check your plan limits.`);
      } else {
        throw new Error(`Jina AI request failed: ${response.status} ${response.statusText}`);
      }
    }

    // Jina AI might return JSON or plain text depending on headers/API specifics
    // Let's prioritize plain text response based on 'X-Return-Format': 'text'
    const textContent = await response.text();

     if (!textContent || textContent.trim() === '') {
        console.warn(`Jina AI returned empty content for ${url}`);
        return null; // Or handle as an error if empty content is unexpected
     }

    console.log(`Successfully scraped text from ${url} (length: ${textContent.length})`);
    return textContent;

  } catch (error) {
    console.error(`Error scraping text from URL ${url}:`, error);
    // Re-throw or return null/error indicator based on desired flow control
    // Returning null allows the calling function (generateMetaTagsFlow) to handle it
    // Re-throwing the specific errors from above to give better feedback
    if (error instanceof Error && (error.message.includes('Authentication') || error.message.includes('Rate Limit'))) {
        throw error;
    }
    // Return null for other generic network/scraping issues
    return null;
  }
}
