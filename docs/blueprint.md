# **App Name**: MetaGenius

## Core Features:

- Meta Tag Generation: Scrape content from URLs using Jina AI and generate SEO-friendly German meta titles (max 59 chars) and descriptions (max 159 chars) using Gemini LLM. The LLM will use the scraped text to create a concise and engaging description.
- Data Presentation: Accept a list of URLs (like from a Google Sheet) and present generated meta titles and descriptions alongside each URL in a table format. The app uses a .env file for API keys.
- CSV Download: Allow users to download the table data (URLs, generated titles, and descriptions) as a CSV file, mimicking a Google Sheet format.

## Style Guidelines:

- Primary color: Light gray (#F5F5F5) for a clean background.
- Secondary color: Dark gray (#333333) for text and important elements.
- Accent: Teal (#008080) for interactive elements and highlights.
- Clear and readable sans-serif font for the table and UI.
- Table-based layout to present URLs, meta titles, and descriptions in a structured way.
- Simple icons for actions like 'Download CSV'.

## Original User Request:
you are a senior fullstack developer and java script expert, your task is create a simple app, which will use jina. ai to scrape the given url from the list as given below, one by one, for example https://ineofit.de/behandlungen/ or https://ineofit.de/behandlungen/hoehenraum-therapie/ and others one by one, and based on the text in the url, create SEO friendly Meta Title, max 59 characters and Meta Description, max 159 Characters, always in German language, and similar to given example, which I will provide like in below meta_example:
<meta_example>
Simuliertes Höhentraining in Bad Feilnbach entdecken ✓ Erwecken Sie Ihr Wohlbefinden ✓ Jetzt Therapietermine sichern und Ihre Sitzung buchen!
</meta_example>

<input>
Ebene 0	Ebene 1	Ebene 2	Titel 1	Länge von Titel 1	Meta Description 1
https://ineofit.de/					
	behandlungen/		Therapie Bad Feilnbach | Innovative Heilmethoden | INEOFIT	58	Ganzheitliche Therapien in Bad Feilnbach ✓ Von IHHT bis Höhenraumtherapie ✓ Innovative & personalisierte Behandlungen. Jetzt Termin vereinbaren!
		/behandlungen/hoehenraum-therapie/	Simuliertes Höhentraining in Bad Feilnbach | INEOFIT	52	Simuliertes Höhentraining in Bad Feilnbach entdecken ✓ Erwecken Sie Ihr Wohlbefinden ✓ Jetzt Therapietermine sichern und Ihre Sitzung buchen!
		/behandlungen/ihht/	IHHT - Therapie & Training in Bad Feilnbach | Ineofit	53	Innovative IHHT-Therapie zur Verbesserung der Zellgesundheit. ✓ Wissenschaftlich fundierte Behandlung für mehr Vitalität.✓ Jetzt buchen! 
	diagnostik/		Diagnostik und Analyse		
		/diagnostik/hrv/	HRV		
		/diagnostik/hoehenvertraeglichkeitstest/	Höhenverträglichkeitstest		
		/diagnostik/24h-blutzuckermessung/	24h Blutzuckermessung		
</input>

the output should be also generated in downloadable google sheet format, like in the input, but with filled title and description. in the real input they might be empty. 
For the task you will need .env with api for jina and api for gemini LLM model to create meta. pls let me know if the task is clear or you need more input
  