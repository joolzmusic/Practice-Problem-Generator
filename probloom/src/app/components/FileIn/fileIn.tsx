import React, { useEffect } from 'react';
import styles from './styles.module.css'

// typescript interface 
// component should receive a prop called onReceive that takes in type String and return type void
interface FileInProps {
  onReceive: (extractedText: string) => void;
}

// functional component called FileIn that takes in a FileInprops props
const FileIn: React.FC<FileInProps> = ({ onReceive }) => {
  // useEffect = React Hook
    useEffect(() => {
        const handleFileChange = async (event: any) => {
            const file = event.target.files[0];
            if (file.type === "application/pdf") {

              //if file is type PDF, then open file reader 
                const reader = new FileReader();
          
                // When the file loading is complete, the async function will then be called
                reader.onload = async (e:any) => {
                  // result = data read from file 
                  const result = e.target?.result;
                  const typedArray = new Uint8Array(result);
          
                  // checks if code is running in a browser environment aka.. defined
                  if (typeof window != 'undefined') {
                    // imports the pdfjs library and returns a promise 
                    const pdfjsLib = await import('pdfjs-dist');
                    // sets up source path for the pdf.js worker script
                    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';
                    // loads pdf document 
                    const loadingTask = pdfjsLib.getDocument({data: typedArray});
                    // retrieves the PDF object 
                    const pdf = await loadingTask.promise;
            
                    // this is to store PDF
                    let extractedText = '';
            
                    for (let i = 1; i <= pdf.numPages; i++) {
                      const page = await pdf.getPage(i);
                      const textContent = await page.getTextContent();
                      const strings = textContent.items.map((item: any) => item.str);
                      extractedText += strings.join(' ') + '\n';
                    }

                    // extracted text is read out into the DOM 
                    // outputText is then linked into the openAI API call as the topic of the generated questions 
                    // helps to update content on web page 
                    document.getElementById('outputText')!.textContent = extractedText;

                    // if extractedText is not empty and onReceive has already been called, just return the extracted text 
                    if (extractedText && onReceive) {
                      onReceive(extractedText);
                  }
                  }
                };
          
                reader.readAsArrayBuffer(file); }
                else {
                  alert('Please upload pdf')
              }
        };

        const inputElement = document.getElementById('pdfInput');
        inputElement?.addEventListener('change', handleFileChange);

        // Cleanup function to remove the event listener
        return () => {
            inputElement?.removeEventListener('change', handleFileChange);
        };
    }, []);

    return (
        <div>
            <input type="file" data-testid="pdfInput" className={styles.pdfInput} id="pdfInput" accept="application/pdf" />
        </div>
    );
};

export default FileIn;
