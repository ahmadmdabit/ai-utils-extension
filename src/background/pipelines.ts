export interface PipelineStep {
  name: 'summarize' | 'translate' | 'scrape' | 'synthesize' | 'generate-title';
  // 'content' is the initial text from the tab
  // Other names are outputs from previous steps
  input: string; 
  output: string;
}

export const pipelines: Record<string, PipelineStep[]> = {
  summarize: [
    { name: 'summarize', input: 'content', output: 'summary' },
  ],
  translate: [
    { name: 'translate', input: 'content', output: 'translation' },
  ],
  scrape: [
    { name: 'scrape', input: 'content', output: 'scrapedData' },
  ],
  'translated-summary': [
    { name: 'summarize', input: 'content', output: 'summary' },
    { name: 'translate', input: 'summary', output: 'translation' },
  ],
  'dual-lang-summary': [
    { name: 'summarize', input: 'content', output: 'summary' },
    { name: 'translate', input: 'summary', output: 'translation' },
  ],
};