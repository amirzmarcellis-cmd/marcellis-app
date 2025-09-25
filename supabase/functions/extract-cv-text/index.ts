import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { fileUrl } = await req.json()
    
    if (!fileUrl) {
      throw new Error('No file URL provided')
    }

    console.log('Extracting text from:', fileUrl)

    // Fetch the file
    const fileResponse = await fetch(fileUrl)
    if (!fileResponse.ok) {
      throw new Error(`Failed to fetch file: ${fileResponse.statusText}`)
    }

    const fileBuffer = await fileResponse.arrayBuffer()
    const fileType = fileResponse.headers.get('content-type') || ''

    let extractedText = ''

    if (fileType.includes('pdf')) {
      // For PDF files, we'll use a simple text extraction approach
      // In a production environment, you'd use a proper PDF parsing library
      const uint8Array = new Uint8Array(fileBuffer)
      const textDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: false })
      
      // Simple text extraction - look for text between PDF text markers
      const pdfString = textDecoder.decode(uint8Array)
      const textMatches = pdfString.match(/\(([^)]+)\)/g) || []
      
      extractedText = textMatches
        .map(match => match.slice(1, -1))
        .filter(text => text.length > 1 && /[a-zA-Z]/.test(text))
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim()

      // If no meaningful text found, provide a fallback
      if (extractedText.length < 50) {
        extractedText = 'CV uploaded - text extraction pending manual review'
      }
    } else {
      // For other file types (DOC, DOCX), provide a placeholder
      extractedText = 'CV uploaded - text extraction pending manual review'
    }

    console.log('Extracted text length:', extractedText.length)

    return new Response(
      JSON.stringify({ 
        text: extractedText.substring(0, 2000), // Limit to 2000 characters
        success: true 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error extracting text:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        text: 'CV uploaded - text extraction failed',
        success: false 
      }),
      {
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      }
    )
  }
})