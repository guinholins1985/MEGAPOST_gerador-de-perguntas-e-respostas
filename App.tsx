
import React, { useState, useCallback } from 'react';
import type { FaqItem as FaqItemType } from './types';
import { generateFaqsFromImage } from './services/geminiService';
import FaqList from './components/FaqList';
import ImageUpload from './components/ImageUpload';
import Loader from './components/Loader';
import { CopyIcon } from './components/icons/CopyIcon';
import { DownloadIcon } from './components/icons/DownloadIcon';
import { CheckIcon } from './components/icons/CheckIcon';

const App: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [faqs, setFaqs] = useState<FaqItemType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

  const handleImageChange = (file: File | null) => {
    setImageFile(file);
    setFaqs([]);
    setError(null);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleGenerateFaqs = useCallback(async () => {
    if (!imageFile) {
      setError('Por favor, selecione uma imagem primeiro.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setFaqs([]);

    try {
      const base64Image = imagePreview?.split(',')[1];
      if (!base64Image) {
        throw new Error('Não foi possível processar a imagem.');
      }
      
      const mimeType = imageFile.type;
      const generatedFaqs = await generateFaqsFromImage(base64Image, mimeType);
      setFaqs(generatedFaqs);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
    } finally {
      setIsLoading(false);
    }
  }, [imageFile, imagePreview]);

  const formatFaqsForExport = useCallback(() => {
    return faqs
      .map(faq => `Pergunta: ${faq.question}\nResposta: ${faq.answer}`)
      .join('\n\n');
  }, [faqs]);

  const handleCopyAll = useCallback(() => {
    if (faqs.length === 0) return;

    const formattedText = formatFaqsForExport();
    navigator.clipboard.writeText(formattedText).then(() => {
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2500);
    }).catch(err => {
      console.error('Failed to copy: ', err);
      setError('Falha ao copiar o texto. Tente novamente.');
    });
  }, [faqs, formatFaqsForExport]);

  const handleDownloadTxt = useCallback(() => {
    if (faqs.length === 0) return;

    const formattedText = formatFaqsForExport();
    const blob = new Blob([formattedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'faq-gerado-ia.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [faqs, formatFaqsForExport]);


  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-500 mb-4">
              Gerador de Perguntas Frequentes para E-commerce
            </h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Faça o upload da imagem de um produto e nossa IA criará 40 perguntas e respostas frequentes, prontas para seu e-commerce.
          </p>
        </header>

        <main className="bg-slate-800/50 rounded-2xl shadow-lg p-6 sm:p-8 border border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col">
              <ImageUpload onImageChange={handleImageChange} imagePreview={imagePreview} />
              <button
                onClick={handleGenerateFaqs}
                disabled={!imageFile || isLoading}
                className="mt-6 w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-md hover:shadow-cyan-500/50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader />
                    Gerando...
                  </>
                ) : (
                   "Gerar Perguntas e Respostas"
                )}
              </button>
            </div>

            <div className="relative min-h-[300px] md:min-h-full bg-slate-900 rounded-lg p-4 border border-slate-700 flex flex-col">
              <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <h2 className="text-2xl font-bold text-slate-200">Resultado</h2>
                {!isLoading && faqs.length > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyAll}
                      disabled={copyStatus === 'copied'}
                      className="flex items-center gap-1.5 text-sm bg-slate-700 hover:bg-slate-600 disabled:bg-green-800/50 disabled:text-green-400 text-slate-300 font-semibold py-1.5 px-3 rounded-md transition-all duration-200"
                      title="Copiar tudo"
                    >
                      {copyStatus === 'copied' ? (
                        <>
                          <CheckIcon className="h-4 w-4" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <CopyIcon className="h-4 w-4" />
                          Copiar
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleDownloadTxt}
                      className="flex items-center gap-1.5 text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold py-1.5 px-3 rounded-md transition-colors"
                      title="Baixar como .txt"
                    >
                      <DownloadIcon className="h-4 w-4" />
                      Baixar
                    </button>
                  </div>
                )}
              </div>
              <div className="flex-grow relative">
                {isLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 rounded-lg z-10">
                    <Loader />
                    <p className="mt-4 text-slate-300">Analisando a imagem e criando o FAQ...</p>
                    <p className="text-sm text-slate-400">Isso pode levar alguns instantes.</p>
                  </div>
                )}
                {error && (
                  <div className="text-red-400 bg-red-900/50 p-4 rounded-lg border border-red-700">
                    <strong>Erro:</strong> {error}
                  </div>
                )}
                {!isLoading && faqs.length > 0 && <FaqList faqs={faqs} />}
                {!isLoading && !error && faqs.length === 0 && (
                  <div className="flex items-center justify-center h-full text-center text-slate-500">
                    <p>As perguntas e respostas aparecerão aqui após a geração.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
        
        <footer className="text-center mt-8 text-slate-500 text-sm">
            <p>Powered by Google Gemini API</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
