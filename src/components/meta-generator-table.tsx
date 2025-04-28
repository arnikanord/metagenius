
'use client';

import type { ChangeEvent, FormEvent } from 'react';
import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Download } from 'lucide-react';
import { generateMetaTags } from '@/ai/flows/generate-meta-tags';
import { useToast } from "@/hooks/use-toast";
import { generateAndDownloadCSV, type MetaData } from '@/lib/csv-utils'; // Ensure MetaData type is exported

export function MetaGeneratorTable() {
  const [urlsInput, setUrlsInput] = useState<string>('');
  const [metaTitleExampleInput, setMetaTitleExampleInput] = useState<string>(''); // State for meta title example
  const [metaDescriptionExampleInput, setMetaDescriptionExampleInput] = useState<string>(''); // State for meta description example
  const [metaData, setMetaData] = useState<MetaData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const handleUrlsInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setUrlsInput(e.target.value);
  };

  const handleMetaTitleExampleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMetaTitleExampleInput(e.target.value); // Handler for meta title example input
  };

  const handleMetaDescriptionExampleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMetaDescriptionExampleInput(e.target.value); // Handler for meta description example input
  };


  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const urls = urlsInput.split('\n').map(url => url.trim()).filter(url => url.length > 0 && url.startsWith('http'));
    const metaTitleExample = metaTitleExampleInput.trim(); // Get the trimmed title example
    const metaDescriptionExample = metaDescriptionExampleInput.trim(); // Get the trimmed description example


    if (urls.length === 0) {
      toast({
        title: "No Valid URLs",
        description: "Please enter at least one valid URL starting with http or https.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setMetaData([]); // Clear previous results

    const results: MetaData[] = [];
    let hasError = false;

    for (const url of urls) {
      try {
        console.log(`Processing URL: ${url}`); // Log start
        // Pass the separate examples to the flow
        const result = await generateMetaTags({
           url,
           metaTitleExample: metaTitleExample || undefined,
           metaDescriptionExample: metaDescriptionExample || undefined
        });
        results.push({ url, ...result });
        console.log(`Successfully processed: ${url}`); // Log success
      } catch (error) {
        console.error(`Error processing URL ${url}:`, error);
        results.push({ url, metaTitle: 'Error processing', metaDescription: 'Failed to generate meta tags' });
        hasError = true;
        toast({
          title: `Error processing ${url}`,
          description: `Could not generate meta tags. Please check the URL and try again. Details: ${error instanceof Error ? error.message : String(error)}`,
          variant: "destructive",
        });
        // Continue processing other URLs
      }
    }

    setMetaData(results);
    setIsLoading(false);

    if (!hasError) {
       toast({
        title: "Generation Complete",
        description: `Successfully generated meta tags for ${results.length} URL(s).`,
      });
    } else {
       toast({
        title: "Generation Partially Complete",
        description: `Generated meta tags for some URLs, but encountered errors with others. Please check the table and logs for details.`,
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    if (metaData.length === 0) {
      toast({
        title: "No Data to Download",
        description: "Generate some meta tags first before downloading.",
        variant: "destructive",
      });
      return;
    }
    generateAndDownloadCSV(metaData);
     toast({
        title: "CSV Download Started",
        description: "Your CSV file is being downloaded.",
      });
  };

  return (
    <Card className="w-full max-w-5xl mx-auto shadow-lg rounded-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-center text-foreground">MetaGenius - SEO Meta Tag Generator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="urls" className="block text-sm font-medium text-foreground mb-1">
              Enter URLs (one per line):
            </label>
            <Textarea
              id="urls"
              value={urlsInput}
              onChange={handleUrlsInputChange}
              placeholder="e.g.&#10;https://ineofit.de/behandlungen/&#10;https://ineofit.de/behandlungen/hoehenraum-therapie/"
              rows={6}
              className="w-full border-input rounded-md shadow-sm focus:ring-primary focus:border-primary"
              required
              aria-required="true"
            />
          </div>

          {/* New Textarea for Meta Title Example */}
          <div>
            <label htmlFor="metaTitleExample" className="block text-sm font-medium text-foreground mb-1">
              Meta Title Example (Optional):
            </label>
            <Textarea
              id="metaTitleExample"
              value={metaTitleExampleInput}
              onChange={handleMetaTitleExampleInputChange}
              placeholder="Provide an example meta title for style guidance (max 59 chars)."
              rows={1} // Shorter height for title
              maxLength={59} // Enforce max length visually
              className="w-full border-input rounded-md shadow-sm focus:ring-primary focus:border-primary"
              aria-describedby="meta-title-example-description"
            />
            <p id="meta-title-example-description" className="mt-1 text-xs text-muted-foreground">
              The AI will try to follow the style and tone of your title example. Max 59 characters.
            </p>
          </div>

          {/* New Textarea for Meta Description Example */}
          <div>
            <label htmlFor="metaDescriptionExample" className="block text-sm font-medium text-foreground mb-1">
              Meta Description Example (Optional):
            </label>
            <Textarea
              id="metaDescriptionExample"
              value={metaDescriptionExampleInput}
              onChange={handleMetaDescriptionExampleInputChange}
              placeholder="Provide an example meta description for style guidance (e.g., including special characters like ✓ or ➤). Max 159 chars."
              rows={3}
              maxLength={159} // Enforce max length visually
              className="w-full border-input rounded-md shadow-sm focus:ring-primary focus:border-primary"
              aria-describedby="meta-description-example-description"
            />
            <p id="meta-description-example-description" className="mt-1 text-xs text-muted-foreground">
              The AI will try to follow the style, tone, and character usage of your description example. Max 159 characters.
            </p>
          </div>


          <Button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 rounded-md shadow"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Meta Tags'
            )}
          </Button>
        </form>

        {metaData.length > 0 && (
          <div className="space-y-4">
             <div className="flex justify-end">
               <Button
                  onClick={handleDownload}
                  variant="outline"
                  className="flex items-center gap-2 rounded-md shadow border-primary text-primary hover:bg-accent/10"
                >
                  <Download className="h-4 w-4" />
                  Download CSV
                </Button>
             </div>
            <div className="overflow-x-auto border rounded-lg shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary">
                    <TableHead className="w-[30%] font-semibold text-secondary-foreground">URL</TableHead>
                    <TableHead className="w-[30%] font-semibold text-secondary-foreground">Generated Meta Title (Max 59)</TableHead>
                    <TableHead className="w-[40%] font-semibold text-secondary-foreground">Generated Meta Description (Max 159)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metaData.map((item, index) => (
                    <TableRow key={index} className="hover:bg-muted/50">
                      <TableCell className="font-medium break-words">{item.url}</TableCell>
                      <TableCell className="break-words">
                        {item.metaTitle} ({item.metaTitle.length} chars)
                      </TableCell>
                      <TableCell className="break-words">
                         {item.metaDescription} ({item.metaDescription.length} chars)
                       </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

